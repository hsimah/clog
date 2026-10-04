<?php

declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
use Clog\Standalone\Schema;
use Eleph\SQLite\Database;

$dir = sys_get_temp_dir() . '/clog-http-' . bin2hex(random_bytes(5)); mkdir($dir, 0700);
$db = new Database($dir . '/clog.sqlite'); Schema::install($db);
$db->insert('clog_users', ['username'=>'editor','role'=>'editor','password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);
$db->insert('clog_users', ['username'=>'reader','role'=>'reader','password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);
$db->insert('clog_users', ['username'=>'admin','role'=>'editor','admin'=>1,'password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);
$socket = stream_socket_server('tcp://127.0.0.1:0'); $address = stream_socket_get_name($socket, false); fclose($socket);
$command = [PHP_BINARY, '-S', $address, dirname(__DIR__) . '/public/index.php'];
if (getenv('CLOG_TEST_GDB')) $command = ['gdb', '--batch', '-ex', 'run', '-ex', 'bt', '--args', ...$command];
$process = proc_open($command, [0=>['pipe','r'],1=>['file',$dir.'/http.log','a'],2=>['file',$dir.'/http.log','a']], $pipes, null,
    [...getenv(), 'CLOG_DB'=>$dir.'/clog.sqlite','CLOG_SESSION_PATH'=>$dir,'CLOG_ORIGIN'=>'http://'.$address]);
$cookies = [];
function request(string $path, string $method = 'GET', ?string $body = null, array $headers = []): array {
    global $address, $cookies, $process;
    $cookie = implode('; ', array_map(fn ($name, $value) => "$name=$value", array_keys($cookies), $cookies));
    $context = stream_context_create(['http'=>['method'=>$method,'header'=>implode("\r\n", [...$headers, 'Cookie: '.$cookie, 'Connection: close']),'content'=>$body ?? '', 'ignore_errors'=>true,'follow_location'=>0,'timeout'=>10]]);
    $response = file_get_contents('http://'.$address.$path, false, $context);
    if ($response === false || !isset($http_response_header[0])) { usleep(200000); throw new RuntimeException('No HTTP response for ' . $method . ' ' . $path . '; server=' . json_encode(proc_get_status($process))); }
    foreach ($http_response_header as $header) if (preg_match('/^Set-Cookie: ([^=]+)=([^;]*)/i', $header, $m)) $cookies[$m[1]]=$m[2];
    preg_match('/\s(\d{3})\s/', $http_response_header[0], $m);
    return [(int)$m[1], $response, $http_response_header];
}
function ensure(bool $ok, string $label): void { if (!$ok) throw new RuntimeException($label); }
function signIn(string $username, string $password = 'test-password-only'): string {
    [$status,$html] = request('/auth/login'); ensure($status===200,'Login page');
    preg_match('/name="csrf" value="([^"]+)"/', $html, $m);
    [$status,,$headers] = request('/auth/login','POST',http_build_query(['csrf'=>$m[1],'username'=>$username,'password'=>$password]),['Content-Type: application/x-www-form-urlencoded']);
    ensure($status===303 && in_array('Location: /', $headers, true),'Login redirects to root');
    [$status,$json] = request('/auth/session'); $session=json_decode($json,true);
    ensure($status===200 && $session['userId']!=='0','Authenticated session'); return $session['nonce'];
}
try {
    for ($i=0;$i<100;$i++) { $ready=@stream_socket_client('tcp://'.$address,$errno,$error,.1); if ($ready) { fclose($ready); break; } usleep(20000); }
    [$status,$body]=request('/healthz'); ensure($status===200,'Health endpoint');
    [$status]=request('/graphql','POST','{"query":"{clogSummary{items}}"}',['Content-Type: application/json']); ensure($status===401,'Anonymous API denied');
    [$status]=request('/auth/login','POST','username=editor&password=test-password-only',['Content-Type: application/x-www-form-urlencoded']); ensure($status===403,'Login CSRF enforced');
    $csrf=signIn('editor');
    [$status]=request('/graphql','POST','{"query":"{clogSummary{items}}"}',['Content-Type: application/json']); ensure($status===403,'GraphQL CSRF enforced');
    $headers=['Content-Type: application/json','X-Clog-CSRF: '.$csrf];
    [$status,$body]=request('/graphql','POST',json_encode(['query'=>'mutation {createClogItem(input:{name:"HTTP item"}){clogItem{id name}}}']),$headers);
    ensure($status===200 && isset(json_decode($body,true)['data']['createClogItem']['clogItem']['id']),'HTTP mutation: '.$body);
    [$status]=request('/graphql','GET'); ensure($status===405,'GraphQL GET denied');
    [$status]=request('/graphql','POST','not-json',$headers); ensure($status===400,'Malformed JSON rejected');
    [$status,$html]=request('/'); ensure($status===200 && str_contains($html,'type="module"'),'Root application shell');
    [$status]=request('/unknown'); ensure($status===404,'Unknown server route');
    [$status,$html]=request('/inventory'); ensure($status===200 && str_contains($html,'/assets/stylex.css') && str_contains($html,'type="module"'),'Compiled deep link shell');
    [$status]=request('/auth/logout','POST',null,['X-Clog-CSRF: '.$csrf]); ensure($status===200,'Logout');
    [$status,$body]=request('/auth/session'); ensure(json_decode($body,true)['userId']==='0','Session invalidated');
    $csrf=signIn('reader');
    [$status,$body]=request('/graphql','POST',json_encode(['query'=>'mutation {createClogItem(input:{name:"Denied"}){clogItem{id}}}']),['Content-Type: application/json','X-Clog-CSRF: '.$csrf]);
    ensure(isset(json_decode($body,true)['errors']),'Reader mutation denied');
    ensure((int)$db->scalar('SELECT COUNT(*) FROM app_clog_item')===1,'Denied mutation persisted nothing');
    $passwordAction = json_encode(['query' => 'mutation($input:ChangeClogUserPasswordInput!){changeClogUserPassword(input:$input){clogUser{id}}}', 'variables' => ['input' => [
        'id' => '2', 'currentPassword' => 'test-password-only', 'newPassword' => 'reader-new-password',
    ]]]);
    [$status] = request('/graphql', 'POST', $passwordAction, ['Content-Type: application/json']);
    ensure($status === 403, 'Password action requires CSRF token');
    [$status, $body] = request('/graphql', 'POST', $passwordAction, ['Content-Type: application/json', 'X-Clog-CSRF: ' . $csrf]);
    ensure($status === 200 && !isset(json_decode($body, true)['errors']), 'Reader changes own password over HTTP: ' . $body);
    request('/auth/logout', 'POST', null, ['X-Clog-CSRF: ' . $csrf]);
    [$status, $html] = request('/auth/login');
    preg_match('/name="csrf" value="([^"]+)"/', $html, $m);
    [$status] = request('/auth/login', 'POST', http_build_query(['csrf' => $m[1], 'username' => 'reader', 'password' => 'test-password-only']), ['Content-Type: application/x-www-form-urlencoded']);
    ensure($status === 401, 'Old password no longer signs in');
    signIn('reader', 'reader-new-password');
    [, $body] = request('/auth/session'); ensure(json_decode($body, true)['isAdmin'] === false, 'Reader session is not administrative');
    [$status, $html] = request('/users/2'); ensure($status === 200 && str_contains($html, 'type="module"'), 'Account deep link shell');
    // An administrator's reset or deletion ends the account's existing sessions.
    $readerCookies = $cookies; $cookies = [];
    $csrf = signIn('admin');
    [, $body] = request('/auth/session'); ensure(json_decode($body, true)['isAdmin'] === true, 'Administrator session');
    $resetAction = json_encode(['query' => 'mutation($input:ResetClogUserPasswordInput!){resetClogUserPassword(input:$input){clogUser{id}}}', 'variables' => ['input' => ['id' => '2', 'newPassword' => 'reader-reset-password']]]);
    [$status, $body] = request('/graphql', 'POST', $resetAction, ['Content-Type: application/json', 'X-Clog-CSRF: ' . $csrf]);
    ensure($status === 200 && !isset(json_decode($body, true)['errors']), 'Administrator resets password over HTTP: ' . $body);
    [, $body] = request('/auth/session'); ensure(json_decode($body, true)['userId'] === '3', 'Reset keeps the administrator signed in');
    $adminCookies = $cookies; $cookies = $readerCookies;
    [, $body] = request('/auth/session'); ensure(json_decode($body, true)['userId'] === '0', 'Reset ended the existing session');
    $cookies = [];
    signIn('reader', 'reader-reset-password');
    $readerCookies = $cookies; $cookies = $adminCookies;
    $deleteAction = json_encode(['query' => 'mutation($input:DeleteClogUserInput!){deleteClogUser(input:$input){deletedId}}', 'variables' => ['input' => ['id' => '2']]]);
    [$status, $body] = request('/graphql', 'POST', $deleteAction, ['Content-Type: application/json', 'X-Clog-CSRF: ' . $csrf]);
    ensure($status === 200 && !isset(json_decode($body, true)['errors']), 'Administrator deletes account over HTTP: ' . $body);
    $cookies = $readerCookies;
    [, $body] = request('/auth/session'); ensure(json_decode($body, true)['userId'] === '0', 'Deleted account session ended');
    echo "PASS: HTTP login, cookies, CSRF, sessions, GraphQL, reader policy, account administration and compiled deep links\n";
} catch (Throwable $error) {
    fwrite(STDERR, file_get_contents($dir . '/http.log'));
    throw $error;
} finally {
    proc_terminate($process); proc_close($process);
    foreach (glob($dir.'/*') as $file) unlink($file); rmdir($dir);
}

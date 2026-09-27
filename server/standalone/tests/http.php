<?php

declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
use Clog\Standalone\Schema;
use Eleph\SQLite\Database;

$dir = sys_get_temp_dir() . '/clog-http-' . bin2hex(random_bytes(5)); mkdir($dir, 0700);
$db = new Database($dir . '/clog.sqlite'); Schema::install($db);
$db->insert('clog_users', ['username'=>'editor','role'=>'editor','password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);
$db->insert('clog_users', ['username'=>'reader','role'=>'reader','password_hash'=>password_hash('test-password-only', PASSWORD_DEFAULT)]);
$socket = stream_socket_server('tcp://127.0.0.1:0'); $address = stream_socket_get_name($socket, false); fclose($socket);
$process = proc_open([PHP_BINARY, '-S', $address, dirname(__DIR__) . '/public/index.php'], [0=>['pipe','r'],1=>['file',$dir.'/http.log','a'],2=>['file',$dir.'/http.log','a']], $pipes, null,
    [...getenv(), 'CLOG_DB'=>$dir.'/clog.sqlite','CLOG_SESSION_PATH'=>$dir,'CLOG_ORIGIN'=>'http://'.$address]);
$cookies = [];
function request(string $path, string $method = 'GET', ?string $body = null, array $headers = []): array {
    global $address, $cookies;
    $cookie = implode('; ', array_map(fn ($name, $value) => "$name=$value", array_keys($cookies), $cookies));
    $context = stream_context_create(['http'=>['method'=>$method,'header'=>implode("\r\n", [...$headers, 'Cookie: '.$cookie]),'content'=>$body ?? '', 'ignore_errors'=>true,'follow_location'=>0,'timeout'=>10]]);
    $response = file_get_contents('http://'.$address.$path, false, $context);
    foreach ($http_response_header as $header) if (preg_match('/^Set-Cookie: ([^=]+)=([^;]*)/i', $header, $m)) $cookies[$m[1]]=$m[2];
    preg_match('/\s(\d{3})\s/', $http_response_header[0], $m);
    return [(int)$m[1], $response, $http_response_header];
}
function ensure(bool $ok, string $label): void { if (!$ok) throw new RuntimeException($label); }
function signIn(string $username): string {
    [$status,$html] = request('/auth/login'); ensure($status===200,'Login page');
    preg_match('/name="csrf" value="([^"]+)"/', $html, $m);
    [$status] = request('/auth/login','POST',http_build_query(['csrf'=>$m[1],'username'=>$username,'password'=>'test-password-only']),['Content-Type: application/x-www-form-urlencoded']);
    ensure($status===303,'Login success');
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
    [$status,$html]=request('/clog/inventory'); ensure($status===200 && str_contains($html,'/clog/assets/stylex.css') && str_contains($html,'type="module"'),'Compiled deep link shell');
    [$status]=request('/auth/logout','POST',null,['X-Clog-CSRF: '.$csrf]); ensure($status===200,'Logout');
    [$status,$body]=request('/auth/session'); ensure(json_decode($body,true)['userId']==='0','Session invalidated');
    $csrf=signIn('reader');
    [$status,$body]=request('/graphql','POST',json_encode(['query'=>'mutation {createClogItem(input:{name:"Denied"}){clogItem{id}}}']),['Content-Type: application/json','X-Clog-CSRF: '.$csrf]);
    ensure(isset(json_decode($body,true)['errors']),'Reader mutation denied');
    ensure((int)$db->scalar('SELECT COUNT(*) FROM app_clog_item')===1,'Denied mutation persisted nothing');
    echo "PASS: HTTP login, cookies, CSRF, sessions, GraphQL, reader policy and compiled deep links\n";
} finally {
    proc_terminate($process); proc_close($process);
    foreach (glob($dir.'/*') as $file) unlink($file); rmdir($dir);
}

<?php
require dirname(__DIR__) . '/bootstrap.php';
use Eleph\Runtime\Storage\{RelationKind, Criteria, Filter};
use Eleph\Runtime\Storage\Testing\AdaptorConformance;
use Eleph\Runtime\Storage\Write\{WriteBatch, Insert};
use Eleph\Runtime\Identity\PendingId;
use Eleph\SQLite\{Database, SQLiteAdaptor};
use Eleph\SQLite\Sql\{TableSchema, Column, FieldMap, EdgePlacement, QueryCompiler};

foreach (RelationKind::cases() as $kind) {
    $db = new Database(':memory:');
    $db->pdo->exec('CREATE TABLE owner (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rank INTEGER, target_id INTEGER REFERENCES target(id)); CREATE TABLE target (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, rank INTEGER, owner_id INTEGER REFERENCES owner(id)); CREATE TABLE owner_target (owner_id INTEGER REFERENCES owner(id), target_id INTEGER REFERENCES target(id), UNIQUE(owner_id,target_id));');
    $columns = ['id'=>new Column('id','INTEGER'), 'name'=>new Column('name','TEXT'), 'rank'=>new Column('rank','INTEGER')];
    $tables = ['Owner'=>new TableSchema('owner',$columns),'Target'=>new TableSchema('target',$columns)];
    $placement = new EdgePlacement('Owner','target','Target',$kind,
        $kind->needsJoinTable() ? 'owner_target' : ($kind->keyIsLocal() ? 'owner' : 'target'),
        $kind->keyIsLocal() ? 'target_id' : 'owner_id', $kind->needsJoinTable() ? 'target_id' : null, 'target');
    $placements = ['Owner.target'=>$placement];
    $adapter = new SQLiteAdaptor($db,$tables,new FieldMap([]),$placements,new QueryCompiler(placements:$placements));
    $failures = (new AdaptorConformance())->check($adapter,'Owner','target','Target');
    if ($failures) throw new RuntimeException($kind->name . ': ' . implode('; ',$failures));
    $adapter->write(new WriteBatch(new Insert('Owner', new PendingId('Owner'), ['name'=>'prefix 50%_\\ suffix'])));
    if ($adapter->count(Criteria::for('Owner')->where(Filter::contains('name','50%_\\'))) !== 1) throw new RuntimeException('Contains escaping');
    echo 'PASS: upstream adapter conformance for ' . $kind->name . "\n";
}

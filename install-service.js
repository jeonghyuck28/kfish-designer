/* Windows 서비스 등록 스크립트
   실행: node install-service.js
   삭제: node uninstall-service.js
*/
var Service = require('node-windows').Service;

var svc = new Service({
    name: 'KFish Designer',
    description: 'K·FISH 시안 생성기 서버',
    script: require('path').join(__dirname, 'server.js'),
    nodeOptions: [],
    env: [{
        name: 'NODE_ENV',
        value: 'production'
    }]
});

svc.on('install', function() {
    svc.start();
    console.log('서비스 설치 및 시작 완료!');
});

svc.install();

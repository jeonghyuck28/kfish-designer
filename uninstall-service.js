/* Windows 서비스 삭제 스크립트
   실행: node uninstall-service.js
*/
var Service = require('node-windows').Service;

var svc = new Service({
    name: 'KFish Designer',
    script: require('path').join(__dirname, 'server.js')
});

svc.on('uninstall', function() {
    console.log('서비스 삭제 완료!');
});

svc.uninstall();

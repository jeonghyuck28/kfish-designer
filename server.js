/* ==========================================================
   K·FISH 시안 생성기 - Express 서버
   - SQLite DB로 프로젝트 저장/불러오기
   - 이미지 업로드 → uploads/ 폴더
   ========================================================== */

const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ===== 미들웨어 =====
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// uploads 폴더 정적 서빙
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));


// ===== 이미지 업로드 설정 =====
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.round(Math.random() * 10000) + ext;
        cb(null, name);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
    fileFilter: function (req, file, cb) {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
});


// ===== DB 초기화 =====
const db = new Database(path.join(__dirname, 'database.db'));
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL DEFAULT '',
        lang TEXT NOT NULL DEFAULT 'ko',
        data TEXT NOT NULL DEFAULT '{}',
        thumbnail TEXT DEFAULT '',
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )
`);


// ===== API: 프로젝트 목록 =====
app.get('/api/projects', (req, res) => {
    const rows = db.prepare(
        'SELECT id, company_name, lang, thumbnail, created_at, updated_at FROM projects ORDER BY updated_at DESC'
    ).all();
    res.json(rows);
});


// ===== API: 프로젝트 상세 조회 =====
app.get('/api/projects/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    res.json(row);
});


// ===== API: 프로젝트 생성 =====
app.post('/api/projects', (req, res) => {
    const { company_name, lang, data } = req.body;
    const result = db.prepare(
        'INSERT INTO projects (company_name, lang, data) VALUES (?, ?, ?)'
    ).run(company_name || '', lang || 'ko', JSON.stringify(data || {}));
    res.json({ id: result.lastInsertRowid });
});


// ===== API: 프로젝트 수정 =====
app.put('/api/projects/:id', (req, res) => {
    const { company_name, lang, data } = req.body;
    const result = db.prepare(
        "UPDATE projects SET company_name = ?, lang = ?, data = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
    ).run(company_name || '', lang || 'ko', JSON.stringify(data || {}), req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    res.json({ success: true });
});


// ===== API: 프로젝트 삭제 =====
app.delete('/api/projects/:id', (req, res) => {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    res.json({ success: true });
});


// ===== API: 이미지 업로드 =====
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });
    res.json({ url: '/uploads/' + req.file.filename });
});


// ===== API: 업로드 이미지 삭제 =====
app.delete('/api/upload', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: '삭제할 파일 URL이 없습니다.' });

    // 경로 조작 방지
    const filename = path.basename(url);
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });

    try {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: '파일 삭제 실패: ' + e.message });
    }
});


// ===== API: 이미지 다중 업로드 =====
app.post('/api/upload-multi', upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: '파일이 없습니다.' });
    const urls = req.files.map(f => '/uploads/' + f.filename);
    res.json({ urls: urls });
});


// ===== 정기 자동 백업 (매일 03시, 최근 30개 보관) =====
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

function autoBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const backupPath = path.join(backupDir, 'auto_' + timestamp + '.db');
        db.pragma('wal_checkpoint(TRUNCATE)');
        fs.copyFileSync(path.join(__dirname, 'database.db'), backupPath);
        console.log('[백업] 자동 백업 완료: ' + backupPath);

        // 오래된 백업 정리 (최근 30개만 유지)
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('auto_') && f.endsWith('.db'))
            .sort()
            .reverse();
        for (let i = 30; i < files.length; i++) {
            fs.unlinkSync(path.join(backupDir, files[i]));
            console.log('[백업] 오래된 백업 삭제: ' + files[i]);
        }
    } catch (e) {
        console.error('[백업] 자동 백업 실패:', e.message);
    }
}

// 서버 시작 시 1회 백업 + 이후 매시간 체크하여 03시에 백업
autoBackup();
setInterval(function() {
    if (new Date().getHours() === 3 && new Date().getMinutes() === 0) {
        autoBackup();
    }
}, 60 * 1000);


// ===== API: SQLite DB 백업 다운로드 (수동) =====
app.get('/api/backup', (req, res) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupPath = path.join(backupDir, 'database_' + timestamp + '.db');

    // WAL 체크포인트 후 복사
    db.pragma('wal_checkpoint(TRUNCATE)');
    fs.copyFileSync(path.join(__dirname, 'database.db'), backupPath);

    res.download(backupPath, 'kfish_backup_' + timestamp + '.db');
});


// ===== SPA 라우팅: 모든 경로 → index.html =====
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ===== Git 자동 pull + 서버 재시작 (5분마다) =====
const { execSync } = require('child_process');

function autoPull() {
    try {
        const result = execSync('git pull', { cwd: __dirname, encoding: 'utf-8', timeout: 15000 });
        if (result.includes('Already up to date')) return;
        console.log('[AutoPull] 변경 감지:');
        console.log(result.trim());

        // server.js 또는 package.json 변경 시에만 서버 재시작
        const needsRestart = result.includes('server.js') || result.includes('package.json');
        if (needsRestart) {
            console.log('[AutoPull] 서버 파일 변경 → 재시작합니다...');
            try { execSync('npm install --production', { cwd: __dirname, encoding: 'utf-8', timeout: 30000 }); } catch(e) {}
            process.exit(0); // 서비스 매니저가 자동 재시작
        } else {
            console.log('[AutoPull] 정적 파일만 변경 → 재시작 불필요');
        }
    } catch (e) {
        console.error('[AutoPull] 실패:', e.message);
    }
}

setInterval(autoPull, 5 * 60 * 1000); // 5분마다


// ===== 서버 시작 =====
app.listen(PORT, () => {
    console.log(`K·FISH 시안 생성기 서버 실행 중: http://localhost:${PORT}`);
});

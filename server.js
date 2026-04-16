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

function loadLocalEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;

    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;

        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (key && process.env[key] === undefined) process.env[key] = value;
    }
}

loadLocalEnv();

const app = express();
const PORT = process.env.PORT || 3000;

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


// ===== API: DeepL 번역 =====
const DEEPL_LANGS = {
    ko: 'KO',
    en: 'EN-US',
    cn: 'ZH-HANS',
    jp: 'JA'
};

function getDeepLConfig() {
    const apiKey = process.env.DEEPL_API_KEY || '';
    const defaultBase = apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
    return {
        apiKey: apiKey,
        baseUrl: process.env.DEEPL_API_BASE || defaultBase
    };
}

function countCodePoints(text) {
    return Array.from(text || '').length;
}

function collectTextFields(data) {
    const fields = [];

    function add(path, value) {
        if (typeof value === 'string' && value.trim()) {
            fields.push({ path: path, value: value });
        }
    }

    add(['company_name'], data && data.company_name);
    add(['company_intro'], data && data.company_intro);

    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    sections.forEach((section, index) => {
        const hasFixedTitle = section && section.fixedTitleIndex !== undefined && section.fixedTitleIndex !== null && section.fixedTitleIndex !== '';
        if (!hasFixedTitle) add(['sections', index, 'title'], section && section.title);
        add(['sections', index, 'desc'], section && section.desc);
        const captions = Array.isArray(section && section.captions) ? section.captions : [];
        captions.forEach((caption, captionIndex) => {
            add(['sections', index, 'captions', captionIndex], caption);
        });
    });

    const products = Array.isArray(data && data.products) ? data.products : [];
    products.forEach((product, index) => {
        add(['products', index, 'name'], product && product.name);
        add(['products', index, 'desc'], product && product.desc);
    });

    const certs = Array.isArray(data && data.certs) ? data.certs : [];
    certs.forEach((cert, index) => {
        add(['certs', index, 'title'], cert && cert.title);
    });

    return fields;
}

function setByPath(target, pathParts, value) {
    let cursor = target;
    for (let i = 0; i < pathParts.length - 1; i++) {
        cursor = cursor[pathParts[i]];
        if (cursor === undefined || cursor === null) return;
    }
    cursor[pathParts[pathParts.length - 1]] = value;
}

function parseDeepLJson(text, response, label) {
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        const contentType = response.headers.get('content-type') || 'unknown';
        const preview = (text || '').replace(/\s+/g, ' ').slice(0, 120);
        throw new Error(label + ' 응답이 JSON이 아닙니다. 상태: ' + response.status + ', Content-Type: ' + contentType + ', 응답: ' + preview);
    }
}

async function fetchDeepLUsage() {
    const config = getDeepLConfig();
    if (!config.apiKey) throw new Error('DeepL API 키가 설정되지 않았습니다.');
    if (typeof fetch !== 'function') throw new Error('현재 Node.js 버전에서 fetch를 사용할 수 없습니다.');

    let response;
    try {
        response = await fetch(config.baseUrl + '/v2/usage', {
            method: 'GET',
            headers: { Authorization: 'DeepL-Auth-Key ' + config.apiKey }
        });
    } catch (e) {
        throw new Error('DeepL 서버에 연결할 수 없습니다. 운영 서버의 외부 HTTPS/DNS/방화벽 설정을 확인하세요.');
    }
    const text = await response.text();
    const data = parseDeepLJson(text, response, 'DeepL 사용량 조회');

    if (!response.ok) {
        throw new Error(data.message || data.error || ('DeepL 사용량 조회 실패: ' + response.status));
    }
    return data;
}

async function translateTexts(fields, sourceLang, targetLang) {
    const config = getDeepLConfig();
    const translated = [];
    const chunkSize = 40;

    for (let i = 0; i < fields.length; i += chunkSize) {
        const chunk = fields.slice(i, i + chunkSize);
        const params = new URLSearchParams();
        chunk.forEach(field => params.append('text', field.value));
        params.append('source_lang', sourceLang);
        params.append('target_lang', targetLang);
        params.append('preserve_formatting', '1');

        let response;
        try {
            response = await fetch(config.baseUrl + '/v2/translate', {
                method: 'POST',
                headers: {
                    Authorization: 'DeepL-Auth-Key ' + config.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
        } catch (e) {
            throw new Error('DeepL 서버에 연결할 수 없습니다. 운영 서버의 외부 HTTPS/DNS/방화벽 설정을 확인하세요.');
        }
        const text = await response.text();
        const data = parseDeepLJson(text, response, 'DeepL 번역');

        if (!response.ok) {
            if (response.status === 456) throw new Error('DeepL 월 사용량 한도를 초과했습니다.');
            throw new Error(data.message || data.error || ('DeepL 번역 실패: ' + response.status));
        }

        const items = Array.isArray(data.translations) ? data.translations : [];
        items.forEach(item => translated.push(item.text || ''));
    }

    return translated;
}

app.get('/api/translate/usage', async (req, res) => {
    try {
        res.json(await fetchDeepLUsage());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/translate', async (req, res) => {
    try {
        const { sourceLang, targetLang, data } = req.body;
        const source = DEEPL_LANGS[sourceLang || 'ko'];
        const target = DEEPL_LANGS[targetLang];

        if (!source || !target) return res.status(400).json({ error: '지원하지 않는 언어입니다.' });
        if (sourceLang === targetLang) return res.status(400).json({ error: '같은 언어로는 번역할 수 없습니다.' });

        const config = getDeepLConfig();
        if (!config.apiKey) return res.status(500).json({ error: 'DeepL API 키가 설정되지 않았습니다.' });
        if (typeof fetch !== 'function') return res.status(500).json({ error: '현재 Node.js 버전에서 fetch를 사용할 수 없습니다.' });

        const fields = collectTextFields(data || {});
        if (fields.length === 0) return res.status(400).json({ error: '번역할 한국어 텍스트가 없습니다.' });

        const sourceCharacterCount = fields.reduce((sum, field) => sum + countCodePoints(field.value), 0);
        const usageBefore = await fetchDeepLUsage();
        if (usageBefore.character_limit && usageBefore.character_count + sourceCharacterCount > usageBefore.character_limit) {
            return res.status(429).json({
                error: 'DeepL 남은 사용량보다 번역할 글자 수가 많습니다.',
                usage: usageBefore,
                sourceCharacterCount: sourceCharacterCount
            });
        }

        const output = JSON.parse(JSON.stringify(data || {}));
        const translatedTexts = await translateTexts(fields, source, target);
        fields.forEach((field, index) => setByPath(output, field.path, translatedTexts[index] || ''));

        let usageAfter = usageBefore;
        try {
            usageAfter = await fetchDeepLUsage();
        } catch (e) {}

        res.json({
            data: output,
            usage: usageAfter,
            sourceCharacterCount: sourceCharacterCount
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
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

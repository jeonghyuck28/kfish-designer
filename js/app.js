/* ==========================================================
   K·FISH 시안 생성기 - 메인 로직
   - 이미지 공유 + 텍스트 언어별 분리
   - _textData[lang]에 언어별 텍스트 보관
   - 언어 탭 전환 시 현재 텍스트 저장 → 새 언어 텍스트 로드
   ========================================================== */

var App = (function() {
    'use strict';

    // ===== 상수 =====
    var LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAHgA0AwERAAIRAQMRAf/EAIEAAQADAQEAAAAAAAAAAAAAAAAEBQYHAgEBAAMBAQEAAAAAAAAAAAAAAAECAwQFBhAAAAUDAgMHBAMAAAAAAAAAAQIDBAUAEQYSEyEiFEFhMhUWBxcxUUIzcaEjEQACAgEDAgYDAAAAAAAAAAAAARECEjFBA2ET8NFxoSIEIeFS/9oADAMBAAIRAxEAPwDhlfQnnCgFAKAUAoBQHXcR9lEcnxLHJtBRVBBc0geecF/1PttThspNUADUdVQhT2Dj9L9w8nJ9jGzXpBtXjlJmCl4dJ8SUnMejlW2Mx6yTcwuFiKLEFa4J7gXKImPpHwFsX6d471tEJv5GbW60Ol5V7a41Con6bGXL5BNim6NImm2jcdR0AVOPSnTFXkER4fl2Vz05rPf2NbUS29zH+jscLj2ASDtydkTI3j1CZeGMAkSRbukkgOQBCxdJFDCN617jmy8imKhdTU5n7awDKBmHjHHXyDVjzRU+yfoSjZwQDW1ukyaTIlMTjcPD29+fHzNtS16RBa1FGhSzvs9LKMMdfY63Iq3kodq8eGcPWiI9UrrFTQRdRI2iwFtwt31av2FLT2ZD49IJ/wAY4788ehrLeUbd7bobuvyvq/2Wt+3+qjvPtZb/ALJwWcGOS9w51tEY5HsDAzUxlw5dMnSQm1mUcnKcdYDyiBdOm1uICIDWvaTbb3KZv8dCBl+RJ5HPOJgGCMaq7EDuUG2raMsPjUKUwjp1jxEPvVuOmKiZIs5cnrMcqdZRNDKuUSIKigg320xES2bpFSKPNcbiBLjTjpioFrSyWXPZJOMxhik3QAMWXcuGhzl3AVM6VIqYqxDcolAU7W+1R2lLf9E5adC5c+6jRNrMhB40zhpDIG6jSUeIrOFCiiuN1iooKHFNLWPcNuyqLg0lzBOfkjNZNlDqfCIBdEiPlEahFo7dx1ptxOJTmv8AkO5xtWlKYz1clbWkvPlSU+SPXfRIddt7fSXPtW6Lor3vq8HN/NU7Cww8ayTn8pMTWxQUAoBQCgFAKA//2Q==';

    var TPL_IMAGES = {
        topBg: 'images/top-bg.jpg',
        headerText: 'images/header-text.png',
        logoParticle: 'images/logo-particle.png',
        companyBg: 'images/company-bg.jpg'
    };

    var LABELS = {
        ko: { why_title: '왜 <em>K·FISH</em> 제품일까요?', why_desc: 'K·FISH는 대한민국 정부가 품질을 인증한<br><strong>수산물 수출통합브랜드</strong>입니다.<br>그 이름만으로도 전 세계 소비자가 믿고 선택할 수 있도록,<br>까다로운 기준을 통과한 수산물만 담았습니다.', products: '<em>K·FISH</em> 승인상품', certs: '품질인증서' },
        en: { why_title: 'Why <em>K·FISH</em>?', why_desc: 'K·FISH is <strong>Korea\'s national seafood export brand</strong>,<br>certified for quality by the Korean government.<br>Only products that meet the strictest standards bear this name.', products: '<em>K·FISH</em> Approved Products', certs: 'Quality Certificates' },
        cn: { why_title: '为什么选择 <em>K·FISH</em>?', why_desc: 'K·FISH是韩国政府认证的<br><strong>水产品出口综合品牌</strong>。<br>只有通过严格标准的水产品才能使用此名称。', products: '<em>K·FISH</em> 认证产品', certs: '质量认证' },
        jp: { why_title: 'なぜ <em>K·FISH</em> なのか?', why_desc: 'K·FISHは韓国政府が品質を認証した<br><strong>水産物輸出統合ブランド</strong>です。<br>厳しい基準を通過した水産物だけを取り扱っています。', products: '<em>K·FISH</em> 承認商品', certs: '品質認証書' }
    };
    var DOWNLOAD_QUALITY_PRESETS = {
        low: { name: '저용량', jpegQuality: 0.55 },
        medium: { name: '기본', jpegQuality: 0.75 },
        high: { name: '고화질', jpegQuality: 0.92 }
    };

    var LANGS = ['ko', 'en', 'cn', 'jp'];
    var LANG_LABELS = { ko: '한국어', en: '영어', cn: '중국어', jp: '일본어' };
    var DEFAULT_SECTION_TITLES = {
        ko: ['설비 관리', '수출관련 현지화 전략', '품질안전관리 전략', '상품 제조현황'],
        en: ['Facility Management', 'Export Localization Strategy', 'Quality and Safety Management Strategy', 'Product Manufacturing Status'],
        cn: ['设备管理', '出口本地化战略', '质量安全管理战略', '产品制造现状'],
        jp: ['設備管理', '輸出関連の現地化戦略', '品質安全管理戦略', '商品製造状況']
    };
    var DEFAULT_SECTIONS = DEFAULT_SECTION_TITLES.ko;
    var AUTOSAVE_INTERVAL_MS = 60 * 1000;

    var _uid = 0;
    function uid() { return ++_uid; }

    var _imageCache = {};
    var _currentProjectId = null;
    var _formProjectId = null;
    var _currentLang = 'ko';
    var _isDownloading = false;
    var _isTranslating = false;
    var _isSaving = false;
    var _lastSavedSignature = '';
    var _lastSavedAt = '';
    var _autoSaveTimer = null;
    var _dirtyCheckTimer = null;
    var _isRestoringProject = false;
    var _isOpeningProject = false;
    var _saveVersion = 0;
    var _savePromise = null;

    // ===== 언어별 텍스트 저장소 =====
    // { ko: { company_name, company_intro, sections: [{title, desc, captions:[]}], products: [{name, desc}], certs: [{title}] }, en: {...}, ... }
    var _textData = {};

    function getDefaultSectionTitle(lang, index) {
        var titles = DEFAULT_SECTION_TITLES[lang] || DEFAULT_SECTION_TITLES.ko;
        return titles[index] || '';
    }

    function emptyTextData(lang) {
        var targetLang = lang || 'ko';
        return {
            company_name: '',
            company_intro: '',
            sections: (DEFAULT_SECTION_TITLES[targetLang] || DEFAULT_SECTION_TITLES.ko).map(function(t, index) {
                return { title: t, desc: '', captions: ['', ''], fixedTitleIndex: index };
            }),
            products: [{ name: '', desc: '' }],
            certs: []
        };
    }

    function initTextData() {
        _textData = {};
        for (var i = 0; i < LANGS.length; i++) {
            _textData[LANGS[i]] = emptyTextData(LANGS[i]);
        }
    }


    // ==========================================================
    //  초기화
    // ==========================================================
    function init() {
        initTextData();
        bindTabEvents();
        bindFileInputEvents();
        bindImageUploadEvents();
        bindDownloadModalEvents();
        bindScrollTracker();
        bindLangSwitch();
        bindEditorChangeEvents();
        buildInitialForm();
        preloadTemplateImages();
        loadProjectList();
        refreshDeepLUsage();
        updateTranslateEstimate();
        setSaveStatus('저장 대기', 'saved');
        startAutoSave();
    }

    function buildInitialForm() {
        // 기본 섹션 4개 + 상품 1개
        for (var i = 0; i < DEFAULT_SECTIONS.length; i++) {
            var secId = addSection(getDefaultSectionTitle('ko', i), i);
            addSectionItem(secId);
            addSectionItem(secId);
        }
        addProduct();
    }

    function preloadTemplateImages() {
        var keys = Object.keys(TPL_IMAGES);
        for (var i = 0; i < keys.length; i++) {
            (function(key) {
                imgToBase64(TPL_IMAGES[key], function(b64) { _imageCache[key] = b64; });
            })(keys[i]);
        }
    }

    function imgToBase64(url, callback) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            callback(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = function() { callback(''); };
        img.src = url;
    }

    function bindTabEvents() {}


    // ==========================================================
    //  언어 전환
    // ==========================================================
    function bindLangSwitch() {
        var tabs = document.querySelectorAll('.lang-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function() {
                // UI 활성화
                var all = document.querySelectorAll('.lang-tab');
                for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
                this.classList.add('active');
                // 라디오 체크
                var radio = this.querySelector('input[name="lang"]');
                if (radio) {
                    radio.checked = true;
                    switchLang(radio.value);
                }
            });
        }
    }

    function setActiveLangTab(lang) {
        var tabs = document.querySelectorAll('.lang-tab');
        for (var i = 0; i < tabs.length; i++) {
            var radio = tabs[i].querySelector('input[name="lang"]');
            var active = !!(radio && radio.value === lang);
            tabs[i].classList.toggle('active', active);
            if (radio) radio.checked = active;
        }
    }

    function bindEditorChangeEvents() {
        var scroll = document.getElementById('editor-scroll');
        if (scroll) {
            scroll.addEventListener('input', function(e) {
                updateTranslateEstimate();
                if (e.target && e.target.id === 'translate-empty-only') return;
                markDirtySoon();
            });
            scroll.addEventListener('change', function(e) {
                updateTranslateEstimate();
                if (e.target && e.target.id === 'translate-empty-only') return;
                markDirtySoon();
            });
        }

        var emptyOnly = document.getElementById('translate-empty-only');
        if (emptyOnly) {
            emptyOnly.addEventListener('change', updateTranslateEstimate);
        }

        window.addEventListener('beforeunload', function(e) {
            if (!hasUnsavedChanges()) return;
            e.preventDefault();
            e.returnValue = '';
        });
    }

    /** 언어 전환: 현재 텍스트 저장 → 새 언어 텍스트 로드 */
    function switchLang(newLang) {
        // 현재 언어 텍스트 저장
        saveCurrentTexts();
        // 새 언어로 전환
        _currentLang = newLang;
        // 새 언어 텍스트 로드
        loadCurrentTexts();
        updateTranslateEstimate();
        markDirtySoon();
    }

    function getFixedTitleIndex(section) {
        if (!section) return null;
        var raw = section.dataset ? section.dataset.fixedTitleIndex : undefined;
        if (raw === undefined || raw === '') return null;
        var index = Number(raw);
        return isNaN(index) ? null : index;
    }

    function setFixedTitleInputState(section, input, fixedIndex) {
        if (!input) return;
        var isFixed = fixedIndex !== null && fixedIndex !== undefined;
        input.readOnly = isFixed;
        input.classList.toggle('sec-title--fixed', isFixed);
        if (section && section.dataset) {
            if (isFixed) section.dataset.fixedTitleIndex = String(fixedIndex);
            else delete section.dataset.fixedTitleIndex;
        }
    }

    function ensureFixedSectionTitlesForLang(lang) {
        var t = _textData[lang];
        if (!t) return;
        if (!Array.isArray(t.sections)) t.sections = [];

        for (var i = 0; i < t.sections.length; i++) {
            var section = t.sections[i] || { title: '', desc: '', captions: [] };
            if (section.fixedTitleIndex !== undefined && section.fixedTitleIndex !== null && section.fixedTitleIndex !== '') {
                var fixedIndex = Number(section.fixedTitleIndex);
                if (!isNaN(fixedIndex)) {
                    section.fixedTitleIndex = fixedIndex;
                    section.title = getDefaultSectionTitle(lang, fixedIndex);
                }
            }
            t.sections[i] = section;
        }
    }

    function ensureDefaultFixedSectionTitles() {
        for (var i = 0; i < LANGS.length; i++) {
            var lang = LANGS[i];
            var t = _textData[lang];
            if (!t) continue;
            if (!Array.isArray(t.sections)) t.sections = [];

            for (var j = 0; j < Math.min(DEFAULT_SECTIONS.length, t.sections.length); j++) {
                if (!t.sections[j]) t.sections[j] = { title: '', desc: '', captions: [] };
                if (t.sections[j].fixedTitleIndex === undefined || t.sections[j].fixedTitleIndex === null || t.sections[j].fixedTitleIndex === '') {
                    t.sections[j].fixedTitleIndex = j;
                }
            }
            ensureFixedSectionTitlesForLang(lang);
        }
    }

    function ensureAllFixedSectionTitles() {
        for (var i = 0; i < LANGS.length; i++) ensureFixedSectionTitlesForLang(LANGS[i]);
    }

    function countCodePoints(text) {
        return Array.from(text || '').length;
    }

    function countTextDataChars(data) {
        var total = 0;

        function add(value) {
            if (typeof value === 'string' && value.trim()) total += countCodePoints(value);
        }

        add(data && data.company_name);
        add(data && data.company_intro);

        var sections = (data && data.sections) || [];
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].fixedTitleIndex === undefined || sections[i].fixedTitleIndex === null || sections[i].fixedTitleIndex === '') {
                add(sections[i].title);
            }
            add(sections[i].desc);
            var captions = sections[i].captions || [];
            for (var j = 0; j < captions.length; j++) add(captions[j]);
        }

        var products = (data && data.products) || [];
        for (var p = 0; p < products.length; p++) {
            add(products[p].name);
            add(products[p].desc);
        }

        var certs = (data && data.certs) || [];
        for (var c = 0; c < certs.length; c++) add(certs[c].title);

        return total;
    }

    function isBlank(value) {
        return !value || !String(value).trim();
    }

    function cloneData(data) {
        return JSON.parse(JSON.stringify(data || {}));
    }

    function getByPath(target, pathParts) {
        var cursor = target;
        for (var i = 0; i < pathParts.length; i++) {
            if (cursor === undefined || cursor === null) return '';
            cursor = cursor[pathParts[i]];
        }
        return cursor;
    }

    function setByPath(target, pathParts, value) {
        var cursor = target;
        for (var i = 0; i < pathParts.length - 1; i++) {
            if (cursor[pathParts[i]] === undefined || cursor[pathParts[i]] === null) {
                cursor[pathParts[i]] = typeof pathParts[i + 1] === 'number' ? [] : {};
            }
            cursor = cursor[pathParts[i]];
        }
        cursor[pathParts[pathParts.length - 1]] = value;
    }

    function collectTranslatablePaths(data) {
        var paths = [];

        function add(path, value) {
            if (typeof value === 'string' && value.trim()) paths.push(path);
        }

        add(['company_name'], data && data.company_name);
        add(['company_intro'], data && data.company_intro);

        var sections = (data && data.sections) || [];
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i] || {};
            if (section.fixedTitleIndex === undefined || section.fixedTitleIndex === null || section.fixedTitleIndex === '') {
                add(['sections', i, 'title'], section.title);
            }
            add(['sections', i, 'desc'], section.desc);
            var captions = section.captions || [];
            for (var j = 0; j < captions.length; j++) add(['sections', i, 'captions', j], captions[j]);
        }

        var products = (data && data.products) || [];
        for (var p = 0; p < products.length; p++) {
            add(['products', p, 'name'], products[p] && products[p].name);
            add(['products', p, 'desc'], products[p] && products[p].desc);
        }

        var certs = (data && data.certs) || [];
        for (var c = 0; c < certs.length; c++) add(['certs', c, 'title'], certs[c] && certs[c].title);

        return paths;
    }

    function buildTranslationSource(source, target, fillEmptyOnly) {
        var payload = cloneData(source);
        var paths = collectTranslatablePaths(source);

        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var shouldTranslate = !fillEmptyOnly || isBlank(getByPath(target, path));
            if (!shouldTranslate) setByPath(payload, path, '');
        }

        return payload;
    }

    function mergeTranslatedIntoTarget(target, translated, fillEmptyOnly) {
        var output = cloneData(target || {});
        var paths = collectTranslatablePaths(translated);

        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            var translatedValue = getByPath(translated, path);
            if (isBlank(translatedValue)) continue;
            if (!fillEmptyOnly || isBlank(getByPath(output, path))) {
                setByPath(output, path, translatedValue);
            }
        }

        return output;
    }

    function isFillEmptyOnlyMode() {
        var el = document.getElementById('translate-empty-only');
        return !el || el.checked;
    }

    function getCurrentTranslationPayload() {
        if (_currentLang === 'ko') return emptyTextData('ko');
        return buildTranslationSource(_textData.ko || emptyTextData('ko'), _textData[_currentLang] || emptyTextData(_currentLang), isFillEmptyOnlyMode());
    }

    function updateTranslateEstimate() {
        var el = document.getElementById('translate-estimate');
        if (!el) return;
        if (_isRestoringProject) return;

        saveCurrentTexts();
        if (_currentLang === 'ko') {
            el.textContent = '번역 대상 없음';
            return;
        }

        var chars = countTextDataChars(getCurrentTranslationPayload());
        el.textContent = '예상 ' + chars.toLocaleString() + '자';
    }

    function normalizeUsage(usage) {
        if (!usage) return null;
        var count = Number(usage.character_count || 0);
        var limit = Number(usage.character_limit || 0);
        if (!limit) return null;
        return { count: count, limit: limit, ratio: count / limit };
    }

    function renderDeepLUsage(usage) {
        var el = document.getElementById('deepl-usage');
        if (!el) return;

        el.classList.remove('warn', 'danger');
        var info = normalizeUsage(usage);
        if (!info) {
            el.textContent = 'DeepL 사용량 확인 불가';
            el.classList.add('warn');
            return;
        }

        el.textContent = 'DeepL ' + info.count.toLocaleString() + ' / ' + info.limit.toLocaleString() + '자';
        if (info.ratio >= 0.96) el.classList.add('danger');
        else if (info.ratio >= 0.9) el.classList.add('warn');
    }

    function refreshDeepLUsage() {
        var el = document.getElementById('deepl-usage');
        if (el) el.textContent = 'DeepL 사용량 확인 중';

        API.getTranslateUsage().then(function(usage) {
            renderDeepLUsage(usage);
        }).catch(function(err) {
            if (el) {
                el.textContent = 'DeepL 사용량 확인 실패';
                el.classList.add('warn');
            }
            console.warn(err);
        });
    }

    function setTranslateButtonLoading(loading) {
        var btn = document.getElementById('btn-translate-current');
        if (!btn) return;
        btn.disabled = loading;
        btn.textContent = loading ? '번역 중...' : '한국어 기준 번역';
    }

    function translateCurrentFromKorean() {
        if (_isTranslating) return;

        saveCurrentTexts();

        if (_currentLang === 'ko') {
            toast('한국어는 번역 대상이 아닙니다.');
            return;
        }

        var fillEmptyOnly = isFillEmptyOnlyMode();
        var source = getCurrentTranslationPayload();
        var sourceChars = countTextDataChars(source);
        if (sourceChars === 0) {
            toast(fillEmptyOnly ? '번역할 빈칸이 없습니다.' : '번역할 한국어 텍스트가 없습니다.');
            return;
        }

        var target = _textData[_currentLang] || emptyTextData();
        if (!fillEmptyOnly && countTextDataChars(target) > 0) {
            var ok = confirm((LANG_LABELS[_currentLang] || '현재 언어') + ' 입력 내용이 번역 결과로 덮어써집니다. 계속할까요?');
            if (!ok) return;
        }

        _isTranslating = true;
        setTranslateButtonLoading(true);

        API.translate('ko', _currentLang, source).then(function(res) {
            _textData[_currentLang] = fillEmptyOnly ? mergeTranslatedIntoTarget(target, res.data, true) : res.data;
            ensureFixedSectionTitlesForLang(_currentLang);
            loadCurrentTexts();
            updateTranslateEstimate();
            if (res.usage) renderDeepLUsage(res.usage);
            return persistProject({ silent: true }).then(function() {
                toast((LANG_LABELS[_currentLang] || '현재 언어') + '로 번역하고 저장했습니다.');
            }).catch(function(err) {
                toast('번역은 완료됐지만 저장에 실패했습니다.');
                console.warn(err);
            });
        }).catch(function(err) {
            toast(err.message || '번역에 실패했습니다.');
            refreshDeepLUsage();
        }).finally(function() {
            _isTranslating = false;
            setTranslateButtonLoading(false);
        });
    }

    /** 폼에서 현재 언어의 텍스트를 _textData에 저장 */
    function saveCurrentTexts() {
        if (_isRestoringProject) return;
        var t = _textData[_currentLang];
        if (!t) return;

        t.company_name = val('inp-company-name');
        t.company_intro = val('inp-company-intro');

        // 섹션
        var secEls = document.querySelectorAll('#sections-container > .card-section');
        t.sections = [];
        for (var i = 0; i < secEls.length; i++) {
            var sec = secEls[i];
            var fixedTitleIndex = getFixedTitleIndex(sec);
            var captions = [];
            var itemEls = sec.querySelectorAll('.section-item');
            for (var j = 0; j < itemEls.length; j++) {
                var cap = itemEls[j].querySelector('.item-caption');
                captions.push(cap ? cap.value : '');
            }
            var sectionText = {
                title: fixedTitleIndex !== null ? getDefaultSectionTitle(_currentLang, fixedTitleIndex) : (sec.querySelector('.sec-title') ? sec.querySelector('.sec-title').value : ''),
                desc: sec.querySelector('.sec-desc') ? sec.querySelector('.sec-desc').value : '',
                captions: captions
            };
            if (fixedTitleIndex !== null) sectionText.fixedTitleIndex = fixedTitleIndex;
            t.sections.push(sectionText);
        }

        // 상품
        var prodEls = document.querySelectorAll('#products-container > .card-item');
        t.products = [];
        for (var i = 0; i < prodEls.length; i++) {
            var p = prodEls[i];
            t.products.push({
                name: p.querySelector('.prod-name') ? p.querySelector('.prod-name').value : '',
                desc: p.querySelector('.prod-desc') ? p.querySelector('.prod-desc').value : ''
            });
        }

        // 인증서
        var certEls = document.querySelectorAll('#certs-container > .card-item');
        t.certs = [];
        for (var i = 0; i < certEls.length; i++) {
            var c = certEls[i];
            t.certs.push({
                title: c.querySelector('.cert-title') ? c.querySelector('.cert-title').value : ''
            });
        }
    }

    /** _textData에서 현재 언어의 텍스트를 폼에 로드 */
    function loadCurrentTexts() {
        var t = _textData[_currentLang];
        if (!t) return;

        setVal('inp-company-name', t.company_name);
        setVal('inp-company-intro', t.company_intro);

        // 섹션 텍스트
        var secEls = document.querySelectorAll('#sections-container > .card-section');
        for (var i = 0; i < secEls.length; i++) {
            var secText = (t.sections && t.sections[i]) ? t.sections[i] : { title: '', desc: '', captions: [] };
            var sec = secEls[i];
            var fixedTitleIndex = getFixedTitleIndex(sec);
            if (fixedTitleIndex === null && secText.fixedTitleIndex !== undefined && secText.fixedTitleIndex !== null && secText.fixedTitleIndex !== '') {
                fixedTitleIndex = Number(secText.fixedTitleIndex);
                if (isNaN(fixedTitleIndex)) fixedTitleIndex = null;
            }
            var titleInput = sec.querySelector('.sec-title');
            setFixedTitleInputState(sec, titleInput, fixedTitleIndex);
            if (titleInput) titleInput.value = fixedTitleIndex !== null ? getDefaultSectionTitle(_currentLang, fixedTitleIndex) : (secText.title || '');
            if (sec.querySelector('.sec-desc')) sec.querySelector('.sec-desc').value = secText.desc || '';
            var itemEls = sec.querySelectorAll('.section-item');
            for (var j = 0; j < itemEls.length; j++) {
                var cap = itemEls[j].querySelector('.item-caption');
                if (cap) cap.value = (secText.captions && secText.captions[j]) ? secText.captions[j] : '';
            }
        }

        // 상품 텍스트
        var prodEls = document.querySelectorAll('#products-container > .card-item');
        for (var i = 0; i < prodEls.length; i++) {
            var prodText = (t.products && t.products[i]) ? t.products[i] : { name: '', desc: '' };
            if (prodEls[i].querySelector('.prod-name')) prodEls[i].querySelector('.prod-name').value = prodText.name || '';
            if (prodEls[i].querySelector('.prod-desc')) prodEls[i].querySelector('.prod-desc').value = prodText.desc || '';
        }

        // 인증서 텍스트
        var certEls = document.querySelectorAll('#certs-container > .card-item');
        for (var i = 0; i < certEls.length; i++) {
            var certText = (t.certs && t.certs[i]) ? t.certs[i] : { title: '' };
            if (certEls[i].querySelector('.cert-title')) certEls[i].querySelector('.cert-title').value = certText.title || '';
        }
    }


    // ==========================================================
    //  스크롤 트래커
    // ==========================================================
    function bindScrollTracker() {
        var scroll = document.getElementById('editor-scroll');
        if (!scroll) return;
        scroll.addEventListener('scroll', function() {
            var targets = ['sec-basic', 'sec-sections', 'sec-products', 'sec-certs'];
            var scrollRect = scroll.getBoundingClientRect();
            var activeTarget = targets[0];
            for (var i = 0; i < targets.length; i++) {
                var el = document.getElementById(targets[i]);
                if (!el) continue;
                if (el.getBoundingClientRect().top - scrollRect.top <= 100) activeTarget = targets[i];
            }
            var items = document.querySelectorAll('.tracker-item');
            for (var i = 0; i < items.length; i++) {
                items[i].classList.toggle('active', items[i].getAttribute('data-target') === activeTarget);
            }
        });
    }

    function scrollTo(targetId) {
        var scroll = document.getElementById('editor-scroll');
        var el = document.getElementById(targetId);
        if (!scroll || !el) return;
        var scrollRect = scroll.getBoundingClientRect();
        var elRect = el.getBoundingClientRect();
        scroll.scrollTo({ top: scroll.scrollTop + elRect.top - scrollRect.top - 10, behavior: 'smooth' });
    }


    // ==========================================================
    //  파일 input 이벤트
    // ==========================================================
    function bindFileInputEvents() {
        document.addEventListener('change', function(e) {
            if (e.target.type !== 'file') return;
            var tid = e.target.getAttribute('data-target');
            if (tid && e.target.files && e.target.files[0]) {
                // 로컬 모드 (API 없을 때) 미리보기
                if (typeof API === 'undefined') {
                    previewFile(e.target.files[0], document.getElementById(tid));
                }
            }
        });
    }

    function previewFile(file, container) {
        if (!container) return;
        container.innerHTML = '';
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement('img');
            img.src = e.target.result;
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }

    function getThumbSrc(id) {
        var el = document.getElementById(id);
        if (el) { var img = el.querySelector('img'); if (img) return img.src; }
        return '';
    }


    // ==========================================================
    //  섹션 폼
    // ==========================================================
    function addSection(defaultTitle, fixedTitleIndex) {
        var id = uid();
        var titleVal = defaultTitle || '';
        var isFixedTitle = fixedTitleIndex !== undefined && fixedTitleIndex !== null;
        var c = document.getElementById('sections-container');
        var div = document.createElement('div');
        div.className = 'card-item card-section';
        div.id = 'section-' + id;
        div.dataset.uid = id;
        if (isFixedTitle) div.dataset.fixedTitleIndex = fixedTitleIndex;
        div.innerHTML =
            '<div class="card-item-header">' +
                '<span class="card-item-label">섹션</span>' +
                '<div class="card-item-actions">' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'sections-container\',' + id + ',-1)">▲</button>' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'sections-container\',' + id + ',1)">▼</button>' +
                    '<button class="btn btn--remove" onclick="App.removeSection(' + id + ')">삭제</button>' +
                '</div>' +
            '</div>' +
            '<div class="form-row">' +
                '<label>섹션 제목' + (isFixedTitle ? ' (고정)' : '') + '</label>' +
                '<input type="text" class="sec-title' + (isFixedTitle ? ' sec-title--fixed' : '') + '" placeholder="예: 설비 관리" value="' + titleVal.replace(/"/g, '&quot;') + '"' + (isFixedTitle ? ' readonly' : '') + '>' +
            '</div>' +
            '<div class="form-row">' +
                '<label>섹션 설명 (선택, 하단 불투명 박스에 표시)</label>' +
                '<textarea class="sec-desc" rows="2" placeholder="예: - 사람의 접촉을 최소화 하여 미생물 오염 방지"></textarea>' +
            '</div>' +
            '<div class="section-items-header">' +
                '<span>하위 아이템</span>' +
                '<button class="btn btn--add-img" onclick="App.addSectionItem(' + id + ')">+ 아이템 추가</button>' +
            '</div>' +
            '<div class="section-items-list" id="sec-items-' + id + '"></div>';
        c.appendChild(div);
        markDirtySoon();
        updateTranslateEstimate();
        return id;
    }

    function addSectionItem(sectionId) {
        var id = uid();
        var list = document.getElementById('sec-items-' + sectionId);
        if (!list) return;
        var div = document.createElement('div');
        div.className = 'section-item';
        div.id = 'sec-item-' + id;
        div.dataset.uid = id;
        div.innerHTML =
            '<div class="section-item-top">' +
                '<span class="section-item-label">아이템</span>' +
                '<div class="section-item-actions">' +
                    '<button class="btn btn--move" onclick="App.moveItemIn(\'sec-items-' + sectionId + '\',' + id + ',-1)">▲</button>' +
                    '<button class="btn btn--move" onclick="App.moveItemIn(\'sec-items-' + sectionId + '\',' + id + ',1)">▼</button>' +
                    '<button class="btn btn--remove" onclick="App.removeEl(\'sec-item-' + id + '\')">X</button>' +
                '</div>' +
            '</div>' +
            '<div class="section-item-body">' +
                '<div class="section-item-file">' +
                    '<input type="file" accept="image/*" multiple data-target="sec-item-thumb-' + id + '" data-bulk="section" data-section-id="' + sectionId + '">' +
                    '<div class="img-thumb" id="sec-item-thumb-' + id + '"></div>' +
                    '<label class="img-fit-toggle"><input type="checkbox" class="item-cover" checked> 채우기</label>' +
                '</div>' +
                '<div class="section-item-caption">' +
                    '<input type="text" class="item-caption" placeholder="캡션 (예: HACCP 인증 시설)">' +
                '</div>' +
            '</div>';
        list.appendChild(div);
        markDirtySoon();
        updateTranslateEstimate();
        return id;
    }

    /** 섹션 삭제 시 _textData 동기화 */
    function removeSection(sectionUid) {
        saveCurrentTexts(); // 먼저 현재 텍스트 저장
        var el = document.getElementById('section-' + sectionUid);
        if (!el) return;
        // 몇 번째 섹션인지 찾기
        var secEls = document.querySelectorAll('#sections-container > .card-section');
        var idx = -1;
        for (var i = 0; i < secEls.length; i++) {
            if (secEls[i] === el) { idx = i; break; }
        }
        el.remove();
        // 모든 언어의 해당 섹션 텍스트 제거
        if (idx >= 0) {
            for (var i = 0; i < LANGS.length; i++) {
                if (_textData[LANGS[i]] && _textData[LANGS[i]].sections) {
                    _textData[LANGS[i]].sections.splice(idx, 1);
                }
            }
        }
        markDirtySoon();
        updateTranslateEstimate();
    }


    // ==========================================================
    //  상품 / 인증서 폼
    // ==========================================================
    function addProduct() {
        var id = uid();
        var c = document.getElementById('products-container');
        var div = document.createElement('div');
        div.className = 'card-item';
        div.id = 'product-' + id;
        div.dataset.uid = id;
        div.innerHTML =
            '<div class="card-item-header">' +
                '<span class="card-item-label">\uc0c1\ud488</span>' +
                '<div class="card-item-actions">' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'products-container\',' + id + ',-1)">▲</button>' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'products-container\',' + id + ',1)">▼</button>' +
                    '<button class="btn btn--remove" onclick="App.removeEl(\'product-' + id + '\')">삭제</button>' +
                '</div>' +
            '</div>' +
            '<div class="form-row"><label>상품명</label><input type="text" class="prod-name" placeholder="예: 냉동 갈치"></div>' +
            '<div class="form-row"><label>상품 설명</label><textarea class="prod-desc" rows="2" placeholder="상품 소개"></textarea></div>' +
            '<div class="form-row"><label>이미지</label><div class="img-upload-stack"><input type="file" accept="image/*" multiple data-target="prod-img-' + id + '" data-bulk="product"><div class="img-thumb" id="prod-img-' + id + '"></div><label class="img-fit-toggle"><input type="checkbox" class="item-cover" checked> 채우기</label></div></div>';
        c.appendChild(div);
        markDirtySoon();
        updateTranslateEstimate();
        return id;
    }

    function addCert() {
        var id = uid();
        var c = document.getElementById('certs-container');
        var div = document.createElement('div');
        div.className = 'card-item';
        div.id = 'cert-' + id;
        div.dataset.uid = id;
        div.innerHTML =
            '<div class="card-item-header">' +
                '<span class="card-item-label">인증서</span>' +
                '<div class="card-item-actions">' +
                    '<button class="btn btn--remove" onclick="App.removeEl(\'cert-' + id + '\')">삭제</button>' +
                '</div>' +
            '</div>' +
            '<div class="form-row"><label>제목 (선택)</label><input type="text" class="cert-title" placeholder="예: HACCP 인증서"></div>' +
            '<div class="form-row"><label>이미지</label><div class="img-upload-stack"><input type="file" accept="image/*" multiple data-target="cert-img-' + id + '" data-bulk="cert"><div class="img-thumb" id="cert-img-' + id + '"></div><label class="img-fit-toggle"><input type="checkbox" class="item-cover" checked> 채우기</label></div></div>';
        c.appendChild(div);
        markDirtySoon();
        updateTranslateEstimate();
        return id;
    }


    // ==========================================================
    //  삭제 / 순서 이동
    // ==========================================================
    function removeEl(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.remove();
        markDirtySoon();
        updateTranslateEstimate();
    }

    function moveItem(cid, itemUid, dir) {
        var c = document.getElementById(cid);
        var items = c.children;
        for (var i = 0; i < items.length; i++) {
            if (parseInt(items[i].dataset.uid) === itemUid) {
                if (dir === -1 && i > 0) c.insertBefore(items[i], items[i - 1]);
                else if (dir === 1 && i < items.length - 1) c.insertBefore(items[i + 1], items[i]);
                markDirtySoon();
                return;
            }
        }
    }

    function moveItemIn(cid, itemUid, dir) { moveItem(cid, itemUid, dir); }


    // ==========================================================
    //  데이터 수집: getFormData(lang)
    //  특정 언어의 전체 데이터 조합 (이미지 + 해당 언어 텍스트)
    // ==========================================================
    function getFormData(lang) {
        // 먼저 현재 폼 텍스트를 저장
        saveCurrentTexts();

        var targetLang = lang || _currentLang;
        var t = _textData[targetLang] || _textData.ko;

        // 이미지 수집
        var secEls = document.querySelectorAll('#sections-container > .card-section');
        var sections = [];
        for (var i = 0; i < secEls.length; i++) {
            var sec = secEls[i];
            var fixedTitleIndex = getFixedTitleIndex(sec);
            var items = [];
            var itemEls = sec.querySelectorAll('.section-item');
            for (var j = 0; j < itemEls.length; j++) {
                var thumb = itemEls[j].querySelector('.img-thumb img');
                var secText = (t.sections && t.sections[i]) ? t.sections[i] : { title: '', desc: '', captions: [] };
                var coverChk = itemEls[j].querySelector('.item-cover');
                items.push({
                    src: thumb ? thumb.src : '',
                    caption: (secText.captions && secText.captions[j]) ? secText.captions[j] : '',
                    cover: coverChk ? coverChk.checked : true
                });
            }
            var sText = (t.sections && t.sections[i]) ? t.sections[i] : { title: '', desc: '' };
            sections.push({
                step: i + 1,
                title: fixedTitleIndex !== null ? getDefaultSectionTitle(targetLang, fixedTitleIndex) : (sText.title || ''),
                description: sText.desc || '',
                items: items
            });
        }

        var prodEls = document.querySelectorAll('#products-container > .card-item');
        var products = [];
        for (var i = 0; i < prodEls.length; i++) {
            var pText = (t.products && t.products[i]) ? t.products[i] : { name: '', desc: '' };
            var prodCover = prodEls[i].querySelector('.item-cover');
            products.push({
                name: pText.name || '',
                description: pText.desc || '',
                image: getThumbSrc('prod-img-' + prodEls[i].dataset.uid),
                cover: prodCover ? prodCover.checked : true
            });
        }

        var certEls = document.querySelectorAll('#certs-container > .card-item');
        var certificates = [];
        for (var i = 0; i < certEls.length; i++) {
            var cText = (t.certs && t.certs[i]) ? t.certs[i] : { title: '' };
            var certCover = certEls[i].querySelector('.item-cover');
            certificates.push({
                image: getThumbSrc('cert-img-' + certEls[i].dataset.uid),
                title: cText.title || '',
                cover: certCover ? certCover.checked : true
            });
        }

        return {
            lang: targetLang,
            company: {
                name: t.company_name || '',
                intro: t.company_intro || '',
                mainImage: getThumbSrc('inp-main-image')
            },
            sections: sections,
            products: products,
            certificates: certificates
        };
    }

    /** DB 저장용 전체 데이터 (이미지 + 모든 언어 텍스트) */
    function getFullData() {
        saveCurrentTexts();
        ensureAllFixedSectionTitles();

        // 이미지 수집
        var secEls = document.querySelectorAll('#sections-container > .card-section');
        var sectionImages = [];
        for (var i = 0; i < secEls.length; i++) {
            var items = [];
            var itemEls = secEls[i].querySelectorAll('.section-item');
            var covers = [];
            for (var j = 0; j < itemEls.length; j++) {
                var thumb = itemEls[j].querySelector('.img-thumb img');
                var coverChk = itemEls[j].querySelector('.item-cover');
                items.push(thumb ? thumb.src : '');
                covers.push(coverChk ? coverChk.checked : true);
            }
            sectionImages.push({ items: items, covers: covers });
        }

        var prodEls = document.querySelectorAll('#products-container > .card-item');
        var productImages = [];
        for (var i = 0; i < prodEls.length; i++) {
            var pc = prodEls[i].querySelector('.item-cover');
            productImages.push({ src: getThumbSrc('prod-img-' + prodEls[i].dataset.uid), cover: pc ? pc.checked : true });
        }

        var certEls = document.querySelectorAll('#certs-container > .card-item');
        var certImages = [];
        for (var i = 0; i < certEls.length; i++) {
            var cc = certEls[i].querySelector('.item-cover');
            certImages.push({ src: getThumbSrc('cert-img-' + certEls[i].dataset.uid), cover: cc ? cc.checked : true });
        }

        return {
            texts: JSON.parse(JSON.stringify(_textData)),
            images: {
                mainImage: getThumbSrc('inp-main-image'),
                sections: sectionImages,
                products: productImages,
                certificates: certImages
            }
        };
    }

    function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }


    // ==========================================================
    //  탭 전환 (입력 / 미리보기)
    // ==========================================================
    function switchTab(tabName) {
        var tabs = document.querySelectorAll('.toolbar-tab');
        var panels = document.querySelectorAll('.editor-panel');
        for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].dataset.tab === tabName);
        for (var i = 0; i < panels.length; i++) panels[i].classList.toggle('active', panels[i].id === 'panel-' + tabName);
        if (tabName === 'preview') refreshPreview();
    }


    // ==========================================================
    //  렌더링
    // ==========================================================
    function refreshPreview() {
        document.getElementById('preview-area').innerHTML = buildHTML(getFormData(), false);
    }

    function buildHTML(data, isExport) {
        var labels = LABELS[data.lang] || LABELS.ko;
        var topBg = isExport ? (_imageCache.topBg || TPL_IMAGES.topBg) : TPL_IMAGES.topBg;
        var hdrTxt = isExport ? (_imageCache.headerText || TPL_IMAGES.headerText) : TPL_IMAGES.headerText;
        var logoP = isExport ? (_imageCache.logoParticle || TPL_IMAGES.logoParticle) : TPL_IMAGES.logoParticle;
        var compBg = isExport ? (_imageCache.companyBg || TPL_IMAGES.companyBg) : TPL_IMAGES.companyBg;

        var h = '<div class="tpl">\n';

        // 상단
        h += '<div class="tpl-header">\n';
        h += '  <img class="tpl-header-bg" src="' + topBg + '" alt="">\n';
        h += '  <div class="tpl-header-overlay">\n';
        h += '    <img class="tpl-header-text" src="' + hdrTxt + '" alt="">\n';
        h += '    <img class="tpl-header-particle" src="' + logoP + '" alt="K·FISH">\n';
        h += '  </div>\n';
        h += '  <div class="tpl-company-name-wrap">\n';
        h += '    <div class="tpl-company-name">' + esc(data.company.name || '업체명') + '</div>\n';
        h += '  </div>\n';
        h += '</div>\n';

        if (data.company.mainImage) {
            h += '<div class="tpl-company-photo"><img src="' + data.company.mainImage + '" alt=""></div>\n';
        }

        if (data.company.intro) {
            h += '<div class="tpl-company-intro">\n';
            h += '  <img class="tpl-company-intro-bg" src="' + compBg + '" alt="">\n';
            h += '  <div class="tpl-company-intro-inner">\n';
            h += '    <div class="tpl-company-intro-name">' + esc(data.company.name || '') + '</div>\n';
            h += '    <p>' + esc(data.company.intro).replace(/\n/g, '<br>') + '</p>\n';
            h += '  </div>\n';
            h += '</div>\n';
        }

        h += '<div class="tpl-body">\n';
        h += '<div class="tpl-why">\n';
        h += '  <div class="tpl-why-title">' + labels.why_title + '</div>\n';
        h += '  <div class="tpl-why-desc">' + labels.why_desc + '</div>\n';
        h += '</div>\n';

        for (var i = 0; i < data.sections.length; i++) {
            var sec = data.sections[i];
            var validItems = sec.items.filter(function(it) { return it.src; });
            if (!sec.title && validItems.length === 0 && !sec.description) continue;
            h += '<div class="tpl-section">\n';
            h += '  <div class="tpl-section-head">\n';
            h += '    <div class="tpl-badge">' + sec.step + '</div>\n';
            h += '    <div class="tpl-pill">' + esc(sec.title || '') + '</div>\n';
            h += '  </div>\n';
            if (validItems.length > 0) {
                var gmod = validItems.length <= 4 ? validItems.length : 'n';
                h += '  <div class="tpl-section-items">\n';
                h += '    <div class="tpl-item-grid tpl-item-grid--' + gmod + '">\n';
                for (var j = 0; j < validItems.length; j++) {
                    h += '      <div class="tpl-item-card">\n';
                    h += '        ' + buildMediaBox(validItems[j].src, 'tpl-item-media', validItems[j].cover, '#f0f0f0') + '\n';
                    if (validItems[j].caption) h += '        <div class="tpl-item-caption">' + esc(validItems[j].caption) + '</div>\n';
                    h += '      </div>\n';
                }
                h += '    </div>\n';
                h += '  </div>\n';
            }
            if (sec.description) {
                h += '  <div class="tpl-section-desc">' + esc(sec.description).replace(/\n/g, '<br>') + '</div>\n';
            }
            h += '</div>\n';
        }

        var validProds = data.products.filter(function(p) { return p.name || p.image; });
        if (validProds.length > 0) {
            for (var i = 0; i < validProds.length; i++) {
                var p = validProds[i];
                h += '<div class="tpl-divider"><div class="tpl-divider-title"><em>K·FISH</em> ' + esc(p.name || '승인상품') + '</div></div>\n';
                h += '<div class="tpl-products"><div class="tpl-product">\n';
                if (p.image) h += '  ' + buildMediaBox(p.image, 'tpl-product-media', p.cover, '#f0f0f0') + '\n';
                if (p.description) h += '  <div class="tpl-product-desc">' + esc(p.description).replace(/\n/g, '<br>') + '</div>\n';
                h += '</div></div>\n';
            }
        }

        var validCerts = data.certificates.filter(function(c) { return c.image; });
        if (validCerts.length > 0) {
            h += '<div class="tpl-certs-header"><div class="tpl-certs-header-title">' + labels.certs + '</div></div>\n';
            h += '<div class="tpl-certs">\n';
            for (var i = 0; i < validCerts.length; i++) {
                var cFit = validCerts[i].cover === false ? ' style="object-fit:contain;background:#fff;"' : '';
                h += '  <div class="tpl-cert"><img src="' + validCerts[i].image + '"' + cFit + ' alt="">\n';
                if (validCerts[i].title) h += '  <div class="tpl-cert-title">' + esc(validCerts[i].title) + '</div>\n';
                h += '  </div>\n';
            }
            h += '</div>\n';
        }

        h += '</div>\n</div>';
        return h;
    }

    function buildMediaBox(src, className, cover, bgColor) {
        var modeClass = cover === false ? ' tpl-media-box--contain' : ' tpl-media-box--cover';
        var style = ' style="background-image:url(&quot;' + esc(src) + '&quot;);';
        if (cover === false && bgColor) style += 'background-color:' + bgColor + ';';
        style += '"';
        return '<div class="' + className + ' tpl-media-box' + modeClass + '"' + style + '></div>';
    }


    // ==========================================================
    //  이미지 다운로드
    // ==========================================================
    function downloadImage() {
        openDownloadModal();
    }

    function bindDownloadModalEvents() {
        var modal = document.getElementById('download-modal');
        if (!modal) return;

        var radios = modal.querySelectorAll('input[name="download-quality"]');
        for (var i = 0; i < radios.length; i++) {
            radios[i].addEventListener('change', syncDownloadQualityOptions);
        }

        var closeBtn = document.getElementById('download-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeDownloadModal);

        var cancelBtn = document.getElementById('download-modal-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', closeDownloadModal);

        var confirmBtn = document.getElementById('download-modal-confirm');
        if (confirmBtn) confirmBtn.addEventListener('click', confirmDownloadImage);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeDownloadModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.hidden) closeDownloadModal();
        });

        syncDownloadQualityOptions();
    }

    function openDownloadModal() {
        var modal = document.getElementById('download-modal');
        if (!modal) return;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        syncDownloadQualityOptions();
    }

    function closeDownloadModal() {
        var modal = document.getElementById('download-modal');
        if (!modal || _isDownloading) return;
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    function syncDownloadQualityOptions() {
        var modal = document.getElementById('download-modal');
        if (!modal) return;
        var options = modal.querySelectorAll('.download-quality-option');
        for (var i = 0; i < options.length; i++) {
            var radio = options[i].querySelector('input[type="radio"]');
            options[i].classList.toggle('active', !!(radio && radio.checked));
        }
    }

    function getSelectedDownloadPreset() {
        var checked = document.querySelector('input[name="download-quality"]:checked');
        var key = checked ? checked.value : 'medium';
        return DOWNLOAD_QUALITY_PRESETS[key] || DOWNLOAD_QUALITY_PRESETS.medium;
    }

    function confirmDownloadImage() {
        if (_isDownloading) return;
        var preset = getSelectedDownloadPreset();
        var data = getFormData();
        var previewArea = document.getElementById('preview-area');
        previewArea.innerHTML = buildHTML(data, false);
        _isDownloading = true;
        closeDownloadModalForced();
        toast('이미지 생성 중... (' + preset.name + ')');
        setTimeout(function() {
            html2canvas(previewArea, { width: 900, scale: 1, useCORS: true, backgroundColor: null }).then(function(canvas) {
                var a = document.createElement('a');
                a.href = canvas.toDataURL('image/jpeg', preset.jpegQuality);
                a.download = (data.company.name || 'kfish_시안') + '_' + data.lang + '.jpg';
                a.click();
                toast('이미지가 다운로드되었습니다!');
            }).catch(function() { toast('이미지 생성 실패'); })
              .finally(function() { _isDownloading = false; });
        }, 200);
    }

    function closeDownloadModalForced() {
        var modal = document.getElementById('download-modal');
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = '';
    }


    // ==========================================================
    //  프로젝트 관리 (DB)
    // ==========================================================
    var _projectsCache = [];

    function loadProjectList() {
        if (typeof API === 'undefined') return;
        API.getProjects().then(function(rows) {
            _projectsCache = rows;
            renderProjectList(rows);
        }).catch(function() {});
        updateCurrentLabel();
    }

    function renderProjectList(rows) {
        var el = document.getElementById('project-list');
        if (rows.length === 0) {
            el.innerHTML = '<div style="padding:20px 14px;font-size:12px;color:#999;text-align:center;">저장된 프로젝트가 없습니다.</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var active = _currentProjectId === r.id ? ' active' : '';
            html += '<div class="project-item' + active + '" onclick="App.openProject(' + r.id + ')">';
            html += '  <div><div class="project-item-name">' + esc(r.company_name || '(미입력)') + '</div>';
            html += '  <div class="project-item-date">' + (r.updated_at || '').substring(0, 16) + '</div></div>';
            html += '  <button class="project-item-del" onclick="event.stopPropagation();App.deleteProject(' + r.id + ')" title="삭제">✕</button>';
            html += '</div>';
        }
        el.innerHTML = html;
    }

    function filterProjects(keyword) {
        var kw = (keyword || '').trim().toLowerCase();
        if (!kw) { renderProjectList(_projectsCache); return; }
        renderProjectList(_projectsCache.filter(function(r) {
            return (r.company_name || '').toLowerCase().indexOf(kw) !== -1;
        }));
    }

    function updateCurrentLabel() {
        var el = document.getElementById('project-current');
        if (!el) return;
        var label = _currentProjectId ? '현재 프로젝트 ID: ' + _currentProjectId : '새 프로젝트 (미저장)';
        if (_lastSavedAt) label += ' · 마지막 저장 ' + _lastSavedAt;
        el.textContent = label;
    }

    function setSaveStatus(text, state) {
        var el = document.getElementById('save-status');
        if (!el) return;
        el.textContent = text;
        el.classList.remove('dirty', 'saving', 'saved', 'error');
        if (state) el.classList.add(state);
    }

    function getCurrentSaveSignature() {
        var fullData = getFullData();
        var name = (_textData.ko && _textData.ko.company_name) || '';
        return buildSaveSignature(name, _currentLang, fullData);
    }

    function hasUnsavedChanges() {
        var fullData = getFullData();
        if (!_lastSavedSignature) return hasMeaningfulContent(fullData);
        var name = (_textData.ko && _textData.ko.company_name) || '';
        return buildSaveSignature(name, _currentLang, fullData) !== _lastSavedSignature;
    }

    function markDirtySoon() {
        if (_isRestoringProject || _isOpeningProject) return;
        if (_dirtyCheckTimer) clearTimeout(_dirtyCheckTimer);
        _dirtyCheckTimer = setTimeout(function() {
            if (_isRestoringProject || _isOpeningProject) return;
            if (hasUnsavedChanges()) setSaveStatus('변경됨', 'dirty');
            else setSaveStatus(_lastSavedAt ? '저장 완료 ' + _lastSavedAt : '저장 대기', 'saved');
        }, 250);
    }

    function confirmUnsavedChanges() {
        if (!hasUnsavedChanges()) return true;
        return confirm('저장되지 않은 변경사항이 있습니다. 계속할까요?');
    }

    function hasMeaningfulContent(fullData) {
        var texts = (fullData && fullData.texts) || {};
        for (var i = 0; i < LANGS.length; i++) {
            if (countTextDataChars(texts[LANGS[i]]) > 0) return true;
        }

        var images = (fullData && fullData.images) || {};
        if (images.mainImage) return true;

        var sections = images.sections || [];
        for (var s = 0; s < sections.length; s++) {
            var items = sections[s].items || sections[s] || [];
            for (var si = 0; si < items.length; si++) {
                if (items[si]) return true;
            }
        }

        var products = images.products || [];
        for (var p = 0; p < products.length; p++) {
            if (products[p] && (products[p].src || typeof products[p] === 'string' && products[p])) return true;
        }

        var certificates = images.certificates || [];
        for (var c = 0; c < certificates.length; c++) {
            if (certificates[c] && (certificates[c].src || typeof certificates[c] === 'string' && certificates[c])) return true;
        }

        return false;
    }

    function buildSaveSignature(name, lang, fullData) {
        return JSON.stringify({ name: name || '', data: fullData || {} });
    }

    function formatSaveTime() {
        var d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function makeTempProjectName() {
        var d = new Date();
        return '임시저장 ' +
            String(d.getMonth() + 1).padStart(2, '0') + '/' +
            String(d.getDate()).padStart(2, '0') + ' ' +
            String(d.getHours()).padStart(2, '0') + ':' +
            String(d.getMinutes()).padStart(2, '0');
    }

    function autoSaveBeforeNavigation(statusText) {
        if (typeof API === 'undefined') return Promise.resolve({ skipped: true });
        var waitForCurrentSave = (_isSaving && _savePromise) ? _savePromise.catch(function() {}) : Promise.resolve({ skipped: true });

        return waitForCurrentSave.then(function() {
            var snapshot = captureProjectSnapshot();
            var changed = snapshot.signature !== _lastSavedSignature;
            if (!_lastSavedSignature && !snapshot.hasContent) return { skipped: true };
            if (_lastSavedSignature && !changed) return { skipped: true };
            return saveProjectSnapshot(snapshot, {
                adoptCreated: false,
                statusText: statusText || '이동 전 저장 중...'
            });
        });
    }

    function captureProjectSnapshot() {
        var fullData = getFullData();
        var name = (_textData.ko && _textData.ko.company_name) || '';
        return {
            projectId: _formProjectId,
            lang: _currentLang,
            name: name,
            fullData: fullData,
            signature: buildSaveSignature(name, _currentLang, fullData),
            hasContent: hasMeaningfulContent(fullData)
        };
    }

    function saveProjectSnapshot(snapshot, options) {
        options = options || {};
        if (!snapshot || !snapshot.hasContent) return Promise.resolve({ skipped: true });
        if (_isSaving) return _savePromise || Promise.resolve({ skipped: true });

        _isSaving = true;
        setSaveStatus(options.statusText || '저장 중...', 'saving');

        var request = snapshot.projectId ?
            API.updateProject(snapshot.projectId, snapshot.name, snapshot.lang, snapshot.fullData) :
            API.createProject(snapshot.name, snapshot.lang, snapshot.fullData);

        _savePromise = request.then(function(res) {
            if (!snapshot.projectId && res && res.id && options.adoptCreated !== false) {
                _currentProjectId = res.id;
                _formProjectId = res.id;
            }
            _lastSavedSignature = snapshot.signature;
            _lastSavedAt = formatSaveTime();
            setSaveStatus('저장 완료 ' + _lastSavedAt, 'saved');
            updateCurrentLabel();
            if (options.refreshList !== false) loadProjectList();
            return res || {};
        }).catch(function(err) {
            setSaveStatus('저장 실패', 'error');
            throw err;
        }).finally(function() {
            _isSaving = false;
            _savePromise = null;
        });

        return _savePromise;
    }

    function persistProject(options) {
        options = options || {};
        if (typeof API === 'undefined') {
            if (!options.silent) toast('서버 모드에서만 사용 가능합니다.');
            return Promise.reject(new Error('서버 모드에서만 사용 가능합니다.'));
        }
        if (_isRestoringProject || (_isOpeningProject && !options.allowDuringNavigation)) return Promise.resolve({ skipped: true });
        if (_isSaving) return _savePromise || Promise.resolve({ skipped: true });

        var snapshot = captureProjectSnapshot();
        var wasNewProject = !snapshot.projectId;

        if (options.requireContent && !snapshot.projectId && !snapshot.hasContent) {
            return Promise.resolve({ skipped: true });
        }

        if (options.skipUnchanged && snapshot.signature === _lastSavedSignature) {
            return Promise.resolve({ skipped: true });
        }

        return saveProjectSnapshot(snapshot, {
            statusText: options.statusText || (options.silent ? '자동 저장 중...' : '저장 중...'),
            refreshList: options.refreshList,
            adoptCreated: options.adoptCreated
        }).then(function(res) {
            if (res && res.skipped) return res;
            if (options.silent) setSaveStatus('자동 저장 ' + _lastSavedAt, 'saved');
            updateCurrentLabel();
            if (!options.silent) {
                toast(wasNewProject ? '새 프로젝트가 생성되었습니다. (ID: ' + (res && res.id ? res.id : _currentProjectId) + ')' : '프로젝트가 저장되었습니다.');
            }
            return res || {};
        }).catch(function(err) {
            if (!options.silent) toast('저장 실패');
            throw err;
        });
    }

    function saveProject() {
        persistProject({ silent: false }).catch(function() {});
    }

    function startAutoSave() {
        if (_autoSaveTimer) clearInterval(_autoSaveTimer);
        _autoSaveTimer = setInterval(function() {
            persistProject({
                silent: true,
                skipUnchanged: true,
                requireContent: true,
                refreshList: false
            }).then(function(res) {
                if (res && !res.skipped) loadProjectList();
            }).catch(function() {});
        }, AUTOSAVE_INTERVAL_MS);
    }

    function openProject(id) {
        if (typeof API === 'undefined') return;
        if (_isOpeningProject) return;
        if (_currentProjectId === id && !hasUnsavedChanges()) return;
        _isOpeningProject = true;
        var previousProjectId = _currentProjectId;
        autoSaveBeforeNavigation('현재 프로젝트 저장 중...').then(function() {
            _saveVersion++;
            _currentProjectId = null;
            _formProjectId = null;
            setSaveStatus('불러오는 중...', 'saving');
            return API.getProject(id);
        }).then(function(row) {
            var fullData = JSON.parse(row.data);
            restoreFullData(fullData);
            _currentProjectId = row.id;
            _formProjectId = row.id;
            var restoredData = getFullData();
            _lastSavedSignature = buildSaveSignature((_textData.ko && _textData.ko.company_name) || '', _currentLang, restoredData);
            _lastSavedAt = '';
            setSaveStatus('저장 완료', 'saved');
            updateTranslateEstimate();
            toast('"' + (row.company_name || '') + '" 프로젝트를 불러왔습니다.');
            loadProjectList();
        }).catch(function() {
            _currentProjectId = previousProjectId;
            _formProjectId = previousProjectId;
            setSaveStatus('불러오기 실패', 'error');
            toast('프로젝트를 불러올 수 없습니다.');
        }).finally(function() {
            _isOpeningProject = false;
        });
    }

    function deleteProject(id) {
        if (_isSaving) { toast('저장 중입니다. 잠시 후 다시 시도하세요.'); return; }
        if (_currentProjectId === id && !confirmUnsavedChanges()) return;
        if (!confirm('정말 삭제하시겠습니까?')) return;
        _saveVersion++;
        API.deleteProject(id).then(function() {
            if (_currentProjectId === id) {
                _currentProjectId = null;
                _formProjectId = null;
                _lastSavedSignature = '';
                _lastSavedAt = '';
                setSaveStatus('저장 대기', 'saved');
                updateCurrentLabel();
            }
            toast('프로젝트가 삭제되었습니다.');
            loadProjectList();
        }).catch(function() { toast('삭제 실패'); });
    }

    function newProject() {
        if (_isOpeningProject) return;
        _isOpeningProject = true;
        autoSaveBeforeNavigation('현재 프로젝트 저장 중...').then(function() {
            _isRestoringProject = true;
            _saveVersion++;
            if (_dirtyCheckTimer) clearTimeout(_dirtyCheckTimer);
            try {
                _currentProjectId = null;
                _formProjectId = null;
                _lastSavedSignature = '';
                _lastSavedAt = '';
                initTextData();
                _currentLang = 'ko';
                setActiveLangTab('ko');

                var tempName = makeTempProjectName();
                _textData.ko.company_name = tempName;
                setVal('inp-company-name', tempName);
                setVal('inp-company-intro', '');
                var mainImg = document.getElementById('inp-main-image');
                if (mainImg) clearThumb('inp-main-image');

                document.getElementById('sections-container').innerHTML = '';
                for (var i = 0; i < DEFAULT_SECTIONS.length; i++) {
                    var secId = addSection(getDefaultSectionTitle('ko', i), i);
                    addSectionItem(secId);
                    addSectionItem(secId);
                }

                document.getElementById('products-container').innerHTML = '';
                addProduct();
                document.getElementById('certs-container').innerHTML = '';
            } finally {
                _isRestoringProject = false;
            }

            updateTranslateEstimate();
            updateCurrentLabel();
            var snapshot = captureProjectSnapshot();
            return saveProjectSnapshot(snapshot, {
                statusText: '새 프로젝트 저장 중...'
            });
        }).then(function() {
            toast('새 프로젝트가 생성되었습니다.');
            updateCurrentLabel();
            loadProjectList();
        }).catch(function() {
            setSaveStatus('새 프로젝트 생성 실패', 'error');
            toast('새 프로젝트를 생성할 수 없습니다.');
        }).finally(function() {
            _isOpeningProject = false;
        });
    }

    /** DB에서 불러온 fullData → 폼 복원 */
    function restoreFullData(fullData) {
        _isRestoringProject = true;
        if (_dirtyCheckTimer) clearTimeout(_dirtyCheckTimer);
        try {

        // 텍스트 복원
        if (fullData.texts) {
            _textData = cloneData(fullData.texts);
            // 빠진 언어가 있으면 빈 데이터로 채움
            for (var i = 0; i < LANGS.length; i++) {
                if (!_textData[LANGS[i]]) _textData[LANGS[i]] = emptyTextData(LANGS[i]);
            }
        } else {
            // 구버전 데이터 호환 (texts 없이 저장된 경우)
            initTextData();
            if (fullData.company) {
                _textData.ko.company_name = fullData.company.name || '';
                _textData.ko.company_intro = fullData.company.intro || '';
            }
        }
        ensureDefaultFixedSectionTitles();

        _currentLang = 'ko';
        setActiveLangTab('ko');

        // 이미지 복원 (섹션 구조 재생성)
        var images = fullData.images || {};

        restoreImg('inp-main-image', images.mainImage, true);

        // 섹션
        document.getElementById('sections-container').innerHTML = '';
        var secImages = images.sections || [];
        var secCount = Math.max(secImages.length, (_textData.ko.sections || []).length);
        for (var i = 0; i < secCount; i++) {
            var koSec = (_textData.ko.sections && _textData.ko.sections[i]) || { title: '', desc: '', captions: [] };
            var fixedTitleIndex = (koSec.fixedTitleIndex !== undefined && koSec.fixedTitleIndex !== null && koSec.fixedTitleIndex !== '') ? Number(koSec.fixedTitleIndex) : null;
            if (isNaN(fixedTitleIndex)) fixedTitleIndex = null;
            var secId = addSection(fixedTitleIndex !== null ? getDefaultSectionTitle('ko', fixedTitleIndex) : koSec.title, fixedTitleIndex);
            var secEl = document.getElementById('section-' + secId);
            if (secEl.querySelector('.sec-desc')) secEl.querySelector('.sec-desc').value = koSec.desc || '';
            var list = document.getElementById('sec-items-' + secId);
            list.innerHTML = '';
            var secImgData = secImages[i] || {};
            var itemImages = secImgData.items || secImgData || [];
            var itemCovers = secImgData.covers || [];
            var itemCount = Math.max(itemImages.length, (koSec.captions || []).length, 2);
            for (var j = 0; j < itemCount; j++) {
                addSectionItem(secId);
                var itemEl = list.querySelector('.section-item:last-child');
                if (itemImages[j]) {
                    var thumb = itemEl.querySelector('.img-thumb');
                    restoreImg(thumb.id, itemImages[j]);
                }
                var cap = itemEl.querySelector('.item-caption');
                if (cap) cap.value = (koSec.captions && koSec.captions[j]) ? koSec.captions[j] : '';
                var coverChk = itemEl.querySelector('.item-cover');
                if (coverChk) coverChk.checked = (itemCovers[j] !== undefined) ? itemCovers[j] : true;
            }
        }

        // 상품
        document.getElementById('products-container').innerHTML = '';
        var prodImages = images.products || [];
        var prodCount = Math.max(prodImages.length, (_textData.ko.products || []).length);
        for (var i = 0; i < prodCount; i++) {
            addProduct();
            var prodEl = document.querySelector('#products-container > .card-item:last-child');
            var koProd = (_textData.ko.products && _textData.ko.products[i]) || { name: '', desc: '' };
            prodEl.querySelector('.prod-name').value = koProd.name || '';
            prodEl.querySelector('.prod-desc').value = koProd.desc || '';
            var pImgData = prodImages[i] || {};
            restoreImg('prod-img-' + prodEl.dataset.uid, pImgData.src || pImgData);
            var pCover = prodEl.querySelector('.item-cover');
            if (pCover) pCover.checked = (pImgData.cover !== undefined) ? pImgData.cover : true;
        }

        // 인증서
        document.getElementById('certs-container').innerHTML = '';
        var certImages = images.certificates || [];
        var certCount = Math.max(certImages.length, (_textData.ko.certs || []).length);
        for (var i = 0; i < certCount; i++) {
            addCert();
            var certEl = document.querySelector('#certs-container > .card-item:last-child');
            var koCert = (_textData.ko.certs && _textData.ko.certs[i]) || { title: '' };
            certEl.querySelector('.cert-title').value = koCert.title || '';
            var cImgData = certImages[i] || {};
            restoreImg('cert-img-' + certEl.dataset.uid, cImgData.src || cImgData);
            var cCover = certEl.querySelector('.item-cover');
            if (cCover) cCover.checked = (cImgData.cover !== undefined) ? cImgData.cover : true;
        }

        loadCurrentTexts();
        } finally {
        _isRestoringProject = false;
        }
    }


    // ==========================================================
    //  이미지 서버 업로드
    // ==========================================================
    function bindImageUploadEvents() {
        document.addEventListener('change', function(e) {
            if (e.target.type !== 'file') return;
            if (typeof API === 'undefined') return;
            var files = e.target.files ? Array.prototype.slice.call(e.target.files) : [];
            var tid = e.target.getAttribute('data-target');
            if (files.length === 0 || !tid) return;
            handleImageFiles(files, tid, e.target.getAttribute('data-bulk'), e.target.getAttribute('data-section-id')).then(function() {
                e.target.value = '';
            }).catch(function() { toast('이미지 업로드 실패'); });
        });

        document.addEventListener('dragover', function(e) {
            var thumb = e.target.closest && e.target.closest('.img-thumb');
            if (!thumb) return;
            e.preventDefault();
            thumb.classList.add('dragover');
        });

        document.addEventListener('dragleave', function(e) {
            var thumb = e.target.closest && e.target.closest('.img-thumb');
            if (thumb) thumb.classList.remove('dragover');
        });

        document.addEventListener('drop', function(e) {
            var thumb = e.target.closest && e.target.closest('.img-thumb');
            if (!thumb || typeof API === 'undefined') return;
            e.preventDefault();
            thumb.classList.remove('dragover');

            var files = Array.prototype.slice.call(e.dataTransfer.files || []).filter(function(file) {
                return file.type && file.type.indexOf('image/') === 0;
            });
            if (files.length === 0) return;

            var input = thumb.parentElement ? thumb.parentElement.querySelector('input[type="file"]') : null;
            var bulk = input ? input.getAttribute('data-bulk') : '';
            var sectionId = input ? input.getAttribute('data-section-id') : '';
            handleImageFiles(files, thumb.id, bulk, sectionId).catch(function() { toast('이미지 업로드 실패'); });
        });
    }

    function createExtraImageTarget(bulkKind, sectionId) {
        if (bulkKind === 'section' && sectionId) {
            addSectionItem(sectionId);
            var list = document.getElementById('sec-items-' + sectionId);
            var item = list ? list.querySelector('.section-item:last-child') : null;
            var thumb = item ? item.querySelector('.img-thumb') : null;
            return thumb ? thumb.id : '';
        }
        if (bulkKind === 'product') {
            var productId = addProduct();
            return productId ? 'prod-img-' + productId : '';
        }
        if (bulkKind === 'cert') {
            var certId = addCert();
            return certId ? 'cert-img-' + certId : '';
        }
        return '';
    }

    function uploadImageToTarget(file, targetId) {
        return API.uploadImage(file).then(function(res) {
            setThumbWithDelete(targetId, res.url);
        });
    }

    function handleImageFiles(files, firstTargetId, bulkKind, sectionId) {
        var chain = Promise.resolve();
        for (var i = 0; i < files.length; i++) {
            (function(index) {
                chain = chain.then(function() {
                    var targetId = index === 0 ? firstTargetId : createExtraImageTarget(bulkKind, sectionId);
                    if (!targetId) return null;
                    return uploadImageToTarget(files[index], targetId);
                });
            })(i);
        }

        return chain.then(function() {
            markDirtySoon();
            toast(files.length > 1 ? files.length + '개 이미지를 업로드했습니다.' : '이미지를 업로드했습니다.');
        });
    }

    function setThumbWithDelete(containerId, url) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        container.classList.add('img-thumb--has');
        var img = document.createElement('img');
        img.src = url;
        container.appendChild(img);
        var del = document.createElement('button');
        del.className = 'img-thumb-del';
        del.textContent = '✕';
        del.title = '이미지 삭제';
        del.onclick = function() {
            if (!confirm('이미지를 삭제하시겠습니까?')) return;
            if (typeof API !== 'undefined') API.deleteImage(url).catch(function() {});
            container.innerHTML = '';
            container.classList.remove('img-thumb--has');
            var fileInput = container.parentElement.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            markDirtySoon();
        };
        container.appendChild(del);
    }


    // ==========================================================
    //  유틸리티
    // ==========================================================
    function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; }
    function restoreImg(id, src, clearWhenEmpty) {
        if (!src) {
            if (clearWhenEmpty) clearThumb(id);
            return;
        }
        setThumbWithDelete(id, src);
    }

    function clearThumb(id) {
        var container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = '';
        container.classList.remove('img-thumb--has');
        var fileInput = container.parentElement ? container.parentElement.querySelector('input[type="file"]') : null;
        if (fileInput) fileInput.value = '';
    }

    function esc(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toast(msg) {
        var el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(function() { el.classList.remove('show'); }, 2200);
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        addSection: addSection,
        addSectionItem: addSectionItem,
        addProduct: addProduct,
        addCert: addCert,
        removeEl: removeEl,
        removeSection: removeSection,
        moveItem: moveItem,
        moveItemIn: moveItemIn,
        switchTab: switchTab,
        switchLang: switchLang,
        translateCurrentFromKorean: translateCurrentFromKorean,
        refreshPreview: refreshPreview,
        downloadImage: downloadImage,
        saveProject: saveProject,
        openProject: openProject,
        deleteProject: deleteProject,
        newProject: newProject,
        filterProjects: filterProjects,
        scrollTo: scrollTo
    };
})();

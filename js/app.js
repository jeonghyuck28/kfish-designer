/* ==========================================================
   K·FISH 시안 생성기 - 메인 로직
   - 900px 고정형 세로 시안
   - 섹션 > 하위 아이템(이미지+캡션) 구조
   - 템플릿 고정 이미지는 images/ 상대경로, export 시 base64 변환
   ========================================================== */

var App = (function() {
    'use strict';

    // ===== 상수 =====

    // K·FISH 텍스트 로고 (작은 파일이라 base64 내장)
    var LOGO_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAHgA0AwERAAIRAQMRAf/EAIEAAQADAQEAAAAAAAAAAAAAAAAEBQYHAgEBAAMBAQEAAAAAAAAAAAAAAAECAwQFBhAAAAUDAgMHBAMAAAAAAAAAAQIDBAUAEQYSEyEiFEFhMhUWBxcxUUIzcaEjEQACAgEDAgYDAAAAAAAAAAAAARECEjFBA2ET8NFxoSIEIeFS/9oADAMBAAIRAxEAPwDhlfQnnCgFAKAUAoBQHXcR9lEcnxLHJtBRVBBc0geecF/1PttThspNUADUdVQhT2Dj9L9w8nJ9jGzXpBtXjlJmCl4dJ8SUnMejlW2Mx6yTcwuFiKLEFa4J7gXKImPpHwFsX6d471tEJv5GbW60Ol5V7a41Con6bGXL5BNim6NImm2jcdR0AVOPSnTFXkER4fl2Vz05rPf2NbUS29zH+jscLj2ASDtydkTI3j1CZeGMAkSRbukkgOQBCxdJFDCN617jmy8imKhdTU5n7awDKBmHjHHXyDVjzRU+yfoSjZwQDW1ukyaTIlMTjcPD29+fHzNtS16RBa1FGhSzvs9LKMMdfY63Iq3kodq8eGcPWiI9UrrFTQRdRI2iwFtwt31av2FLT2ZD49IJ/wAY4788ehrLeUbd7bobuvyvq/2Wt+3+qjvPtZb/ALJwWcGOS9w51tEY5HsDAzUxlw5dMnSQm1mUcnKcdYDyiBdOm1uICIDWvaTbb3KZv8dCBl+RJ5HPOJgGCMaq7EDuUG2raMsPjUKUwjp1jxEPvVuOmKiZIs5cnrMcqdZRNDKuUSIKigg320xES2bpFSKPNcbiBLjTjpioFrSyWXPZJOMxhik3QAMWXcuGhzl3AVM6VIqYqxDcolAU7W+1R2lLf9E5adC5c+6jRNrMhB40zhpDIG6jSUeIrOFCiiuN1iooKHFNLWPcNuyqLg0lzBOfkjNZNlDqfCIBdEiPlEahFo7dx1ptxOJTmv8AkO5xtWlKYz1clbWkvPlSU+SPXfRIddt7fSXPtW6Lor3vq8HN/NU7Cww8ayTn8pMTWxQUAoBQCgFAKA//2Q==';

    // 템플릿 고정 이미지 (미리보기용 상대경로)
    var TPL_IMAGES = {
        topBg: 'images/top-bg.jpg',
        headerText: 'images/header-text.png',
        logoParticle: 'images/logo-particle.png',
        companyBg: 'images/company-bg.jpg'
    };

    // 다국어 라벨
    var LABELS = {
        ko: {
            why_title: '왜 <em>K·FISH</em> 제품일까요?',
            why_desc: 'K·FISH는 대한민국 정부가 품질을 인증한<br><strong>수산물 수출통합브랜드</strong>입니다.<br>그 이름만으로도 전 세계 소비자가 믿고 선택할 수 있도록,<br>까다로운 기준을 통과한 수산물만 담았습니다.',
            products: '<em>K·FISH</em> 승인상품',
            certs: '품질인증서'
        },
        en: {
            why_title: 'Why <em>K·FISH</em>?',
            why_desc: 'K·FISH is <strong>Korea\'s national seafood export brand</strong>,<br>certified for quality by the Korean government.<br>Only products that meet the strictest standards bear this name.',
            products: '<em>K·FISH</em> Approved Products',
            certs: 'Quality Certificates'
        },
        cn: {
            why_title: '为什么选择 <em>K·FISH</em>?',
            why_desc: 'K·FISH是韩国政府认证的<br><strong>水产品出口综合品牌</strong>。<br>只有通过严格标准的水产品才能使用此名称。',
            products: '<em>K·FISH</em> 认证产品',
            certs: '质量认证'
        },
        jp: {
            why_title: 'なぜ <em>K·FISH</em> なのか?',
            why_desc: 'K·FISHは韓国政府が品質を認証した<br><strong>水産物輸出統合ブランド</strong>です。<br>厳しい基準を通過した水産物だけを取り扱っています。',
            products: '<em>K·FISH</em> 承認商品',
            certs: '品質認証書'
        }
    };

    var _uid = 0;
    function uid() { return ++_uid; }

    // base64 캐시 (export용)
    var _imageCache = {};

    // 현재 편집 중인 프로젝트 ID (null = 신규)
    var _currentProjectId = null;


    // ==========================================================
    //  초기화
    // ==========================================================
    // 기본 섹션 프리셋
    var DEFAULT_SECTIONS = [
        '설비 관리',
        '수출관련 현지화 전략',
        '품질안전관리 전략',
        '상품 제조현황'
    ];

    function init() {
        bindTabEvents();
        bindFileInputEvents();
        bindImageUploadEvents();
        bindScrollTracker();
        // 기본 섹션 4개 프리셋 (각각 아이템 2개) + 상품 1개
        for (var i = 0; i < DEFAULT_SECTIONS.length; i++) {
            var secId = addSection(DEFAULT_SECTIONS[i]);
            addSectionItem(secId);
            addSectionItem(secId);
        }
        addProduct();
        // 템플릿 고정 이미지 base64 사전 로딩 (export용)
        preloadTemplateImages();
        // 프로젝트 목록 로드
        loadProjectList();
    }

    /** 템플릿 고정 이미지를 base64로 사전 로딩 */
    function preloadTemplateImages() {
        var keys = Object.keys(TPL_IMAGES);
        for (var i = 0; i < keys.length; i++) {
            (function(key) {
                imgToBase64(TPL_IMAGES[key], function(b64) {
                    _imageCache[key] = b64;
                });
            })(keys[i]);
        }
    }

    /** 이미지 URL → base64 (비동기) */
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
    //  섹션 트래커: 스크롤 위치 감지 → 활성 탭 표시
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
                var rect = el.getBoundingClientRect();
                if (rect.top - scrollRect.top <= 100) {
                    activeTarget = targets[i];
                }
            }
            var items = document.querySelectorAll('.tracker-item');
            for (var i = 0; i < items.length; i++) {
                items[i].classList.toggle('active', items[i].getAttribute('data-target') === activeTarget);
            }
        });
    }

    /** 트래커 클릭 → 해당 섹션으로 스크롤 */
    function scrollTo(targetId) {
        var scroll = document.getElementById('editor-scroll');
        var el = document.getElementById(targetId);
        if (!scroll || !el) return;
        var scrollRect = scroll.getBoundingClientRect();
        var elRect = el.getBoundingClientRect();
        scroll.scrollTo({ top: scroll.scrollTop + elRect.top - scrollRect.top - 10, behavior: 'smooth' });
    }


    // ==========================================================
    //  파일 input 이벤트 위임
    // ==========================================================
    function bindFileInputEvents() {
        document.addEventListener('change', function(e) {
            if (e.target.type !== 'file') return;
            var tid = e.target.getAttribute('data-target');
            if (tid && e.target.files && e.target.files[0]) {
                previewFile(e.target.files[0], document.getElementById(tid));
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
    //  섹션 폼 (섹션 = 제목 + 하위 아이템 목록)
    // ==========================================================
    function addSection(defaultTitle) {
        var id = uid();
        var titleVal = defaultTitle || '';
        var c = document.getElementById('sections-container');
        var div = document.createElement('div');
        div.className = 'card-item card-section';
        div.id = 'section-' + id;
        div.dataset.uid = id;
        div.innerHTML =
            '<div class="card-item-header">' +
                '<span class="card-item-label">섹션</span>' +
                '<div class="card-item-actions">' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'sections-container\',' + id + ',-1)">▲</button>' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'sections-container\',' + id + ',1)">▼</button>' +
                    '<button class="btn btn--remove" onclick="App.removeEl(\'section-' + id + '\')">삭제</button>' +
                '</div>' +
            '</div>' +
            '<div class="form-row">' +
                '<label>섹션 제목</label>' +
                '<input type="text" class="sec-title" placeholder="예: 설비 관리" value="' + titleVal.replace(/"/g, '&quot;') + '">' +
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
                    '<input type="file" accept="image/*" data-target="sec-item-thumb-' + id + '">' +
                    '<div class="img-thumb" id="sec-item-thumb-' + id + '"></div>' +
                '</div>' +
                '<div class="section-item-caption">' +
                    '<input type="text" class="item-caption" placeholder="캡션 (예: HACCP 인증 시설)">' +
                '</div>' +
            '</div>';
        list.appendChild(div);
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
                '<span class="card-item-label">상품</span>' +
                '<div class="card-item-actions">' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'products-container\',' + id + ',-1)">▲</button>' +
                    '<button class="btn btn--move" onclick="App.moveItem(\'products-container\',' + id + ',1)">▼</button>' +
                    '<button class="btn btn--remove" onclick="App.removeEl(\'product-' + id + '\')">삭제</button>' +
                '</div>' +
            '</div>' +
            '<div class="form-row"><label>상품명</label><input type="text" class="prod-name" placeholder="예: 냉동 갈치"></div>' +
            '<div class="form-row"><label>상품 설명</label><textarea class="prod-desc" rows="2" placeholder="상품 소개"></textarea></div>' +
            '<div class="form-row"><label>이미지</label><input type="file" accept="image/*" data-target="prod-img-' + id + '"><div class="img-thumb" id="prod-img-' + id + '"></div></div>';
        c.appendChild(div);
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
            '<div class="form-row"><label>이미지</label><input type="file" accept="image/*" data-target="cert-img-' + id + '"><div class="img-thumb" id="cert-img-' + id + '"></div></div>';
        c.appendChild(div);
    }


    // ==========================================================
    //  삭제 / 순서 이동
    // ==========================================================
    function removeEl(id) { var el = document.getElementById(id); if (el) el.remove(); }

    function moveItem(cid, itemUid, dir) {
        var c = document.getElementById(cid);
        var items = c.children;
        for (var i = 0; i < items.length; i++) {
            if (parseInt(items[i].dataset.uid) === itemUid) {
                if (dir === -1 && i > 0) c.insertBefore(items[i], items[i - 1]);
                else if (dir === 1 && i < items.length - 1) c.insertBefore(items[i + 1], items[i]);
                return;
            }
        }
    }

    function moveItemIn(cid, itemUid, dir) { moveItem(cid, itemUid, dir); }


    // ==========================================================
    //  데이터 수집: getFormData()
    // ==========================================================
    function getFormData() {
        var data = {
            lang: document.querySelector('input[name="lang"]:checked').value,
            company: {
                name: val('inp-company-name'),
                intro: val('inp-company-intro'),
                mainImage: getThumbSrc('inp-main-image')
            },
            sections: [],
            products: [],
            certificates: []
        };

        // 섹션
        var secEls = document.querySelectorAll('#sections-container > .card-section');
        for (var i = 0; i < secEls.length; i++) {
            var sec = secEls[i];
            var items = [];
            var itemEls = sec.querySelectorAll('.section-item');
            for (var j = 0; j < itemEls.length; j++) {
                var thumb = itemEls[j].querySelector('.img-thumb img');
                var cap = itemEls[j].querySelector('.item-caption');
                items.push({ src: thumb ? thumb.src : '', caption: cap ? cap.value : '' });
            }
            data.sections.push({
                step: i + 1,
                title: sec.querySelector('.sec-title') ? sec.querySelector('.sec-title').value : '',
                description: sec.querySelector('.sec-desc') ? sec.querySelector('.sec-desc').value : '',
                items: items
            });
        }

        // 상품
        var prodEls = document.querySelectorAll('#products-container > .card-item');
        for (var i = 0; i < prodEls.length; i++) {
            var p = prodEls[i];
            data.products.push({
                name: p.querySelector('.prod-name') ? p.querySelector('.prod-name').value : '',
                description: p.querySelector('.prod-desc') ? p.querySelector('.prod-desc').value : '',
                image: getThumbSrc('prod-img-' + p.dataset.uid)
            });
        }

        // 인증서
        var certEls = document.querySelectorAll('#certs-container > .card-item');
        for (var i = 0; i < certEls.length; i++) {
            var c = certEls[i];
            data.certificates.push({
                image: getThumbSrc('cert-img-' + c.dataset.uid),
                title: c.querySelector('.cert-title') ? c.querySelector('.cert-title').value : ''
            });
        }

        return data;
    }

    function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }


    // ==========================================================
    //  탭 전환 (입력 / 미리보기)
    // ==========================================================
    function switchTab(tabName) {
        // 탭 버튼 활성화
        var tabs = document.querySelectorAll('.toolbar-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.toggle('active', tabs[i].dataset.tab === tabName);
        }
        // 패널 전환
        var panels = document.querySelectorAll('.editor-panel');
        for (var i = 0; i < panels.length; i++) {
            panels[i].classList.toggle('active', panels[i].id === 'panel-' + tabName);
        }
        // 미리보기 탭이면 렌더링
        if (tabName === 'preview') refreshPreview();
    }

    // ==========================================================
    //  렌더링
    // ==========================================================
    function refreshPreview() {
        document.getElementById('preview-area').innerHTML = buildHTML(getFormData(), false);
    }



    // ==========================================================
    //  HTML 빌더
    //  isExport: true면 고정이미지를 base64 캐시 사용
    // ==========================================================
    function buildHTML(data, isExport) {
        var labels = LABELS[data.lang] || LABELS.ko;

        // 템플릿 고정 이미지 경로 결정
        var topBg = isExport ? (_imageCache.topBg || TPL_IMAGES.topBg) : TPL_IMAGES.topBg;
        var hdrTxt = isExport ? (_imageCache.headerText || TPL_IMAGES.headerText) : TPL_IMAGES.headerText;
        var logoP = isExport ? (_imageCache.logoParticle || TPL_IMAGES.logoParticle) : TPL_IMAGES.logoParticle;
        var compBg = isExport ? (_imageCache.companyBg || TPL_IMAGES.companyBg) : TPL_IMAGES.companyBg;

        var h = '';
        h += '<div class="tpl">\n';

        // --- 상단: 수중 배경 + 소개 문구 + 파티클 로고 ---
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

        // --- 대표 이미지 (풀너비) ---
        if (data.company.mainImage) {
            h += '<div class="tpl-company-photo"><img src="' + data.company.mainImage + '" alt=""></div>\n';
        }

        // --- 업체 소개 텍스트 (배경 이미지 적용) ---
        if (data.company.intro) {
            h += '<div class="tpl-company-intro">\n';
            h += '  <img class="tpl-company-intro-bg" src="' + compBg + '" alt="">\n';
            h += '  <div class="tpl-company-intro-inner">\n';
            h += '    <div class="tpl-company-intro-name">' + esc(data.company.name || '') + '</div>\n';
            h += '    <p>' + esc(data.company.intro).replace(/\n/g, '<br>') + '</p>\n';
            h += '  </div>\n';
            h += '</div>\n';
        }

        // --- tpl-body 래퍼 시작 (5단계 그라디언트 배경) ---
        h += '<div class="tpl-body">\n';

        // --- 왜 K·FISH ---
        h += '<div class="tpl-why">\n';
        h += '  <div class="tpl-why-title">' + labels.why_title + '</div>\n';
        h += '  <div class="tpl-why-desc">' + labels.why_desc + '</div>\n';
        h += '</div>\n';

        // --- 반복 섹션 ---
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
                    h += '        <img src="' + validItems[j].src + '" alt="">\n';
                    if (validItems[j].caption) {
                        h += '        <div class="tpl-item-caption">' + esc(validItems[j].caption) + '</div>\n';
                    }
                    h += '      </div>\n';
                }
                h += '    </div>\n';
                h += '  </div>\n';
            }

            // 섹션 하단 설명 (불투명 배경)
            if (sec.description) {
                h += '  <div class="tpl-section-desc">' + esc(sec.description).replace(/\n/g, '<br>') + '</div>\n';
            }
            h += '</div>\n';
        }

        // --- 승인상품 ---
        var validProds = data.products.filter(function(p) { return p.name || p.image; });
        if (validProds.length > 0) {
            for (var i = 0; i < validProds.length; i++) {
                var p = validProds[i];
                h += '<div class="tpl-divider">\n';
                h += '  <div class="tpl-divider-title"><em>K·FISH</em> ' + esc(p.name || '승인상품') + '</div>\n';
                h += '</div>\n';
                h += '<div class="tpl-products">\n';
                h += '  <div class="tpl-product">\n';
                if (p.image) h += '    <img src="' + p.image + '" alt="">\n';
                if (p.description) h += '    <div class="tpl-product-desc">' + esc(p.description).replace(/\n/g, '<br>') + '</div>\n';
                h += '  </div>\n';
                h += '</div>\n';
            }
        }

        // --- 품질인증서 ---
        var validCerts = data.certificates.filter(function(c) { return c.image; });
        if (validCerts.length > 0) {
            h += '<div class="tpl-certs-header"><div class="tpl-certs-header-title">' + labels.certs + '</div></div>\n';
            h += '<div class="tpl-certs">\n';
            for (var i = 0; i < validCerts.length; i++) {
                h += '  <div class="tpl-cert">\n';
                h += '    <img src="' + validCerts[i].image + '" alt="">\n';
                if (validCerts[i].title) h += '    <div class="tpl-cert-title">' + esc(validCerts[i].title) + '</div>\n';
                h += '  </div>\n';
            }
            h += '</div>\n';
        }

        // --- tpl-body 래퍼 닫기 ---
        h += '</div>\n';

        h += '</div>';
        return h;
    }


    // ==========================================================
    //  이미지 다운로드
    // ==========================================================

    /** 이미지 다운로드 (html2canvas로 캡처) */
    function downloadImage() {
        var data = getFormData();
        // 미리보기 영역에 렌더링
        var previewArea = document.getElementById('preview-area');
        previewArea.innerHTML = buildHTML(data, false);

        toast('이미지 생성 중...');
        setTimeout(function() {
            html2canvas(previewArea, {
                width: 900,
                scale: 1,
                useCORS: true,
                backgroundColor: null
            }).then(function(canvas) {
                var a = document.createElement('a');
                a.href = canvas.toDataURL('image/jpeg', 0.85);
                a.download = (data.company.name || 'kfish_시안') + '.jpg';
                a.click();
                toast('이미지가 다운로드되었습니다!');
            }).catch(function() {
                toast('이미지 생성 실패');
            });
        }, 200);
    }


    // ==========================================================
    //  JSON 저장 / 불러오기
    // ==========================================================
    function saveJSON() {
        var data = getFormData();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = (data.company.name || 'kfish_data') + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
        toast('JSON이 저장되었습니다!');
    }

    function loadJSON(event) {
        var file = event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try { restoreFormData(JSON.parse(e.target.result)); toast('데이터를 불러왔습니다!'); }
            catch(err) { toast('JSON 형식이 올바르지 않습니다.'); }
        };
        reader.readAsText(file);
    }

    function restoreFormData(data) {
        var r = document.querySelector('input[name="lang"][value="' + data.lang + '"]');
        if (r) r.checked = true;

        setVal('inp-company-name', data.company.name);
        setVal('inp-company-intro', data.company.intro);
        restoreImg('inp-main-image', data.company.mainImage);

        // 섹션
        document.getElementById('sections-container').innerHTML = '';
        for (var i = 0; i < data.sections.length; i++) {
            var secId = addSection();
            var secEl = document.getElementById('section-' + secId);
            secEl.querySelector('.sec-title').value = data.sections[i].title || '';
            if (secEl.querySelector('.sec-desc')) secEl.querySelector('.sec-desc').value = data.sections[i].description || '';
            var list = document.getElementById('sec-items-' + secId);
            list.innerHTML = '';
            for (var j = 0; j < data.sections[i].items.length; j++) {
                addSectionItem(secId);
                var itemEl = list.querySelector('.section-item:last-child');
                var item = data.sections[i].items[j];
                if (item.src) {
                    var thumb = itemEl.querySelector('.img-thumb');
                    var img = document.createElement('img');
                    img.src = item.src;
                    thumb.appendChild(img);
                }
                var cap = itemEl.querySelector('.item-caption');
                if (cap) cap.value = item.caption || '';
            }
        }

        // 상품
        document.getElementById('products-container').innerHTML = '';
        for (var i = 0; i < data.products.length; i++) {
            addProduct();
            var prodEl = document.querySelector('#products-container > .card-item:last-child');
            prodEl.querySelector('.prod-name').value = data.products[i].name || '';
            prodEl.querySelector('.prod-desc').value = data.products[i].description || '';
            restoreImg('prod-img-' + prodEl.dataset.uid, data.products[i].image);
        }

        // 인증서
        document.getElementById('certs-container').innerHTML = '';
        for (var i = 0; i < data.certificates.length; i++) {
            addCert();
            var certEl = document.querySelector('#certs-container > .card-item:last-child');
            certEl.querySelector('.cert-title').value = data.certificates[i].title || '';
            restoreImg('cert-img-' + certEl.dataset.uid, data.certificates[i].image);
        }
    }

    function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; }
    function restoreImg(id, src) {
        if (!src) return;
        var c = document.getElementById(id); if (!c) return;
        c.innerHTML = '';
        var img = document.createElement('img'); img.src = src; c.appendChild(img);
    }


    // ==========================================================
    //  프로젝트 관리 (DB 연동)
    // ==========================================================

    // 프로젝트 목록 캐시 (검색용)
    var _projectsCache = [];

    /** 프로젝트 목록 불러오기 */
    function loadProjectList() {
        if (typeof API === 'undefined') return;
        API.getProjects().then(function(rows) {
            _projectsCache = rows;
            renderProjectList(rows);
        }).catch(function() {});
        updateCurrentLabel();
    }

    /** 프로젝트 목록 렌더링 */
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
            html += '  <div>';
            html += '    <div class="project-item-name">' + esc(r.company_name || '(미입력)') + '</div>';
            html += '    <div class="project-item-date">' + (r.updated_at || '').substring(0, 16) + '</div>';
            html += '  </div>';
            html += '  <button class="project-item-del" onclick="event.stopPropagation();App.deleteProject(' + r.id + ')" title="삭제">✕</button>';
            html += '</div>';
        }
        el.innerHTML = html;
    }

    /** 프로젝트 검색 필터 */
    function filterProjects(keyword) {
        var kw = (keyword || '').trim().toLowerCase();
        if (!kw) {
            renderProjectList(_projectsCache);
            return;
        }
        var filtered = _projectsCache.filter(function(r) {
            return (r.company_name || '').toLowerCase().indexOf(kw) !== -1;
        });
        renderProjectList(filtered);
    }

    /** 현재 프로젝트 라벨 업데이트 */
    function updateCurrentLabel() {
        var el = document.getElementById('project-current');
        if (!el) return;
        if (_currentProjectId) {
            el.textContent = '현재 프로젝트 ID: ' + _currentProjectId;
        } else {
            el.textContent = '새 프로젝트 (미저장)';
        }
    }

    /** DB에 프로젝트 저장 (생성 or 수정) */
    function saveProject() {
        if (typeof API === 'undefined') { toast('서버 모드에서만 사용 가능합니다.'); return; }
        var data = getFormData();
        var name = data.company.name || '';

        if (_currentProjectId) {
            // 수정
            API.updateProject(_currentProjectId, name, data.lang, data).then(function() {
                toast('프로젝트가 저장되었습니다.');
                loadProjectList();
            }).catch(function() { toast('저장 실패'); });
        } else {
            // 생성
            API.createProject(name, data.lang, data).then(function(res) {
                _currentProjectId = res.id;
                toast('새 프로젝트가 생성되었습니다. (ID: ' + res.id + ')');
                loadProjectList();
            }).catch(function() { toast('생성 실패'); });
        }
    }

    /** DB에서 프로젝트 불러오기 */
    function openProject(id) {
        if (typeof API === 'undefined') return;
        API.getProject(id).then(function(row) {
            var data = JSON.parse(row.data);
            _currentProjectId = row.id;
            restoreFormData(data);
            toast('"' + (row.company_name || '') + '" 프로젝트를 불러왔습니다.');
            loadProjectList();
        }).catch(function() { toast('프로젝트를 불러올 수 없습니다.'); });
    }

    /** 프로젝트 삭제 */
    function deleteProject(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        API.deleteProject(id).then(function() {
            if (_currentProjectId === id) {
                _currentProjectId = null;
                updateCurrentLabel();
            }
            toast('프로젝트가 삭제되었습니다.');
            loadProjectList();
        }).catch(function() { toast('삭제 실패'); });
    }

    /** 새 프로젝트 (폼 초기화) */
    function newProject() {
        _currentProjectId = null;
        // 폼 초기화
        setVal('inp-company-name', '');
        setVal('inp-company-intro', '');
        var mainImg = document.getElementById('inp-main-image');
        if (mainImg) mainImg.innerHTML = '';
        document.querySelector('input[name="lang"][value="ko"]').checked = true;

        document.getElementById('sections-container').innerHTML = '';
        for (var i = 0; i < DEFAULT_SECTIONS.length; i++) {
            var secId = addSection(DEFAULT_SECTIONS[i]);
            addSectionItem(secId);
            addSectionItem(secId);
        }

        document.getElementById('products-container').innerHTML = '';
        addProduct();

        document.getElementById('certs-container').innerHTML = '';

        toast('새 프로젝트가 준비되었습니다.');
        updateCurrentLabel();
        loadProjectList();
    }


    // ==========================================================
    //  이미지 서버 업로드 (file input → 서버 업로드 → URL 저장)
    // ==========================================================
    function bindImageUploadEvents() {
        document.addEventListener('change', function(e) {
            if (e.target.type !== 'file') return;
            if (typeof API === 'undefined') return;
            var file = e.target.files && e.target.files[0];
            var tid = e.target.getAttribute('data-target');
            if (!file || !tid) return;

            API.uploadImage(file).then(function(res) {
                setThumbWithDelete(tid, res.url);
            }).catch(function() {
                toast('이미지 업로드 실패');
            });
        });
    }

    /** 썸네일 + 삭제 버튼 세팅 */
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
            if (typeof API !== 'undefined') {
                API.deleteImage(url).catch(function() {});
            }
            container.innerHTML = '';
            container.classList.remove('img-thumb--has');
            // file input 초기화
            var fileInput = container.parentElement.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
        };
        container.appendChild(del);
    }


    // ==========================================================
    //  유틸리티
    // ==========================================================
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
        moveItem: moveItem,
        moveItemIn: moveItemIn,
        switchTab: switchTab,
        refreshPreview: refreshPreview,
        downloadImage: downloadImage,
        saveJSON: saveJSON,
        loadJSON: loadJSON,
        saveProject: saveProject,
        openProject: openProject,
        deleteProject: deleteProject,
        newProject: newProject,
        filterProjects: filterProjects,
        scrollTo: scrollTo
    };
})();

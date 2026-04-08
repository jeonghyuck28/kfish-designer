/* ==========================================================
   K·FISH 시안 생성기 - API 통신 모듈
   - 프로젝트 CRUD + 이미지 업로드
   ========================================================== */

var API = (function() {
    'use strict';

    var BASE = '/api';

    /** 공통 fetch 래퍼 */
    function request(method, url, body) {
        var opts = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) opts.body = JSON.stringify(body);
        return fetch(BASE + url, opts).then(function(res) {
            if (!res.ok) throw new Error('API 오류: ' + res.status);
            return res.json();
        });
    }

    /** 프로젝트 목록 조회 */
    function getProjects() {
        return request('GET', '/projects');
    }

    /** 프로젝트 상세 조회 */
    function getProject(id) {
        return request('GET', '/projects/' + id);
    }

    /** 프로젝트 생성 → { id } 반환 */
    function createProject(companyName, lang, data) {
        return request('POST', '/projects', {
            company_name: companyName,
            lang: lang,
            data: data
        });
    }

    /** 프로젝트 수정 */
    function updateProject(id, companyName, lang, data) {
        return request('PUT', '/projects/' + id, {
            company_name: companyName,
            lang: lang,
            data: data
        });
    }

    /** 프로젝트 삭제 */
    function deleteProject(id) {
        return request('DELETE', '/projects/' + id);
    }

    /** 업로드 이미지 삭제 */
    function deleteImage(url) {
        return request('DELETE', '/upload', { url: url });
    }

    /** 이미지 업로드 (단일) → { url } 반환 */
    function uploadImage(file) {
        var formData = new FormData();
        formData.append('image', file);
        return fetch(BASE + '/upload', {
            method: 'POST',
            body: formData
        }).then(function(res) {
            if (!res.ok) throw new Error('업로드 오류: ' + res.status);
            return res.json();
        });
    }

    /** 이미지 다중 업로드 → { urls: [] } 반환 */
    function uploadImages(files) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        return fetch(BASE + '/upload-multi', {
            method: 'POST',
            body: formData
        }).then(function(res) {
            if (!res.ok) throw new Error('업로드 오류: ' + res.status);
            return res.json();
        });
    }

    return {
        getProjects: getProjects,
        getProject: getProject,
        createProject: createProject,
        updateProject: updateProject,
        deleteProject: deleteProject,
        deleteImage: deleteImage,
        uploadImage: uploadImage,
        uploadImages: uploadImages
    };
})();

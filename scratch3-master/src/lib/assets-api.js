import xhr from 'xhr';

// 从URL参数获取API地址
const getUrlParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

//获取角色库
const getSpriteLibrary = () => new Promise((resolve, reject) => {
    //TODO 缓存到本地
    let api = "./static/json_index/sprites.json"
    
    // 优先从URL参数获取
    const spriteApiFromUrl = getUrlParam('spriteApi');
    if (spriteApiFromUrl) {
        api = spriteApiFromUrl;
    }
    // 其次从全局配置获取
    else if(window.scratchConfig && window.scratchConfig.assets && window.scratchConfig.assets.defaultIndex && window.scratchConfig.assets.defaultIndex.sprites){
        api = window.scratchConfig.assets.defaultIndex.sprites;
    }
    
    xhr({
        method: 'GET',
        uri: api,
        json: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject(new Error(response.status));
        }
        return resolve(response.body);
    });
});

//获取造型库
const getCostumeLibrary = () => new Promise((resolve, reject) => {
    let api = "./static/json_index/costumes.json"
    if(window.scratchConfig && window.scratchConfig.assets && window.scratchConfig.assets.defaultIndex && window.scratchConfig.assets.defaultIndex.costumes){
        api = window.scratchConfig.assets.defaultIndex.costumes;
    }
    xhr({
        method: 'GET',
        uri: api,
        json: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject(new Error(response.status));
        }
        return resolve(response.body);
    });
});

//获取背景库
const getBackdropLibrary = () => new Promise((resolve, reject) => {
    let api = "./static/json_index/backdrops.json"
    
    // 优先从URL参数获取
    const backdropApiFromUrl = getUrlParam('backdropApi');
    if (backdropApiFromUrl) {
        api = backdropApiFromUrl;
    }
    // 其次从全局配置获取
    else if(window.scratchConfig && window.scratchConfig.assets && window.scratchConfig.assets.defaultIndex && window.scratchConfig.assets.defaultIndex.backdrops){
        api = window.scratchConfig.assets.defaultIndex.backdrops;
    }
    
    xhr({
        method: 'GET',
        uri: api,
        json: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject(new Error(response.status));
        }
        return resolve(response.body);
    });
});

//获取声音库
const getSoundLibrary = () => new Promise((resolve, reject) => {
    let api = "./static/json_index/sounds.json"
    
    // 优先从URL参数获取
    const soundApiFromUrl = getUrlParam('soundApi');
    if (soundApiFromUrl) {
        api = soundApiFromUrl;
    }
    // 其次从全局配置获取
    else if(window.scratchConfig && window.scratchConfig.assets && window.scratchConfig.assets.defaultIndex && window.scratchConfig.assets.defaultIndex.sounds){
        api = window.scratchConfig.assets.defaultIndex.sounds;
    }
    
    xhr({
        method: 'GET',
        uri: api,
        json: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject(new Error(response.status));
        }
        return resolve(response.body);
    });
});

export {
    getSpriteLibrary,
    getCostumeLibrary,
    getBackdropLibrary,
    getSoundLibrary
};

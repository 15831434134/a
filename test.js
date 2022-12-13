const execa = require('execa');
const path = require('path');
const fs = require('fs');

const envEnum = {
    beta: 'beta',
    prod: 'prod'
};

const resolve = (dir) => {
    return path.join(__dirname, `./${dir}`);
};

const isEnvTest = (app_env) => {
    return app_env === envEnum.beta;
};

const isEnvProd = (app_env) => {
    return app_env === envEnum.prod;
};

const getPublishTag = (app_env) => {
    let publishTag = '';
    if (isEnvProd(app_env)) {
        publishTag = '';
    }
    if (isEnvTest(app_env)) {
        publishTag = envEnum.beta;
    }
    return publishTag;
};

const getVersions = (versions, env) => {
    const processVersion = versions.startsWith('[') ? JSON.parse(versions) : JSON.parse(JSON.stringify(versions));
    const vs = processVersion && (Array.isArray(processVersion) ? processVersion : [processVersion]);
    // 没有发布过包的情况
    if (!vs || !vs.length) {
        let version = '';
        if (isEnvTest(env)) {
            version = `1.0.0-beta.0`;
        } else {
            version = '1.0.0';
        }
        return version;
    }
    // 测试环境包
    if (isEnvTest(env)) {
        let lastVer = vs.filter((item) => item.includes(envEnum.beta)).pop();
        if (!lastVer) {
            lastVer = '1.0.0-beta.0';
        }
        return lastVer;
    }
    // 生产环境包
    if (isEnvProd(env)) {
        let lastVer = vs.filter((item) => !item.includes(envEnum.beta)).pop();
        if (!lastVer) {
            lastVer = '1.0.0';
        }
        // prod ==> 当筛选出来的版本号不是正常的线上版本的话  重新规定版本  主版本号+1，  是正常版本的话，就往下进行 兼容已经存在的版本
        const processVer = lastVer.split('.');
        const pv1 = processVer[0];
        const pv3 = processVer[2];
        if (pv3 && pv3 != 0 && !Number(pv3)) {
            lastVer = `${Number(pv1) + 1}.0.0`;
        }
        return lastVer;
    }
    return vs.pop();
};

const dumpVersion = (version, channel = '', maxV = 99) => {
    if (isEnvTest(channel)) {
        const oldV = version;
        let processVer = oldV.split('.');
        const processVerLen = processVer.length;
        let pv2 = processVer[2].split('-');
        processVer[2] = [...pv2];
        if (processVer[processVerLen - 1] >= maxV) {
            processVer[processVerLen - 2][0]++;
            processVer[processVerLen - 1] = 0;
        } else {
            processVer[processVerLen - 1]++;
        }
        processVer[2] = processVer[2].join('-');
        return processVer.join('.');
    }
    const oldV = version;
    let processVer = oldV.split('.');
    const processVerLen = processVer.length;
    if (processVer[processVerLen - 1] >= maxV) {
        processVer[processVerLen - 2]++;
        processVer[processVerLen - 1] = 0;
    } else {
        processVer[processVerLen - 1]++;
    }
    return processVer.join('.');
};

const upDatePkg = async () => {
    try {
        const app_env = process.env.NODE_ENV;

        const checkMaster = await execa('git', ['checkout', 'master']);
        // console.log('master===分支检出完毕');
        console.log('分支检出完毕');

        const pkgInfo = JSON.parse(fs.readFileSync(`${resolve('package.json')}`, 'utf-8'));
        console.log('package.json读取完毕');

        const versionExeca = await execa('npm', ['info', pkgInfo.name, 'versions', '--json']);
        let version = getVersions(versionExeca.stdout, app_env);
        console.log('最新版本号', version);

        const publishTag = getPublishTag(app_env);
        console.log('tagName', publishTag);

        const new_version = dumpVersion(version, publishTag);
        console.log('新版本号', new_version);

        const updateV = await execa('yarn', ['version', '--new-version', new_version]);
        console.log('更新版本号', updateV.stdout);

        const tag1 = await execa('git', ['push', '--tags']);
        // console.log('tags完毕', tag1);
        console.log('tags完毕');

        const tag2 = await execa('git', ['push', '--follow-tags']);
        // console.log('follow-tags完毕', tag2);
        console.log('follow-tags完毕');

        if (publishTag) {
            const goPublishTag = execa('npm', ['publish', '--tag', publishTag]);
            // console.log('goPublishTag', goPublishTag.stdout);
            console.log('goPublishTag', publishTag);
        } else {
            const nPpublishTag = execa('npm', ['publish']);
            // console.log('nPpublishTag', nPpublishTag.stderr);
            console.log('nPpublishTag', publishTag || 'prod');
        }
    } catch (error) {
        console.log(error);
    }
};
upDatePkg();

const execa = require('execa');
const isEnvTest = (app_env) => {
    return app_env === 'beta';
};
const isEnvProd = (app_env) => {
    return app_env === 'prod';
};
const getPublishTag = (app_env) => {
    let publishTag = '';
    if (isEnvProd(app_env)) {
        publishTag = '';
    }
    if (isEnvTest(app_env)) {
        publishTag = 'beta';
    }
    return publishTag;
};
// const app_env = 'beta';

const getVersions = (versions, env) => {
    const vs = versions && (Array.isArray(versions) ? versions : [versions]);
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
        let lastVer = vs.filter((item) => !!item.includes('beta')).pop();
        if (!lastVer) {
            lastVer = '1.0.0-beta.0';
        }
        return lastVer;
    }
    // 生产环境包
    if (isEnvProd(env)) {
        let lastVer = vs.filter((item) => !item.includes('beta')).pop();
        if (!lastVer) {
            lastVer = '1.0.0';
        }
        // prod ==> 当筛选出来的版本号不是正常的线上版本的话  重新规定版本  主版本号+1，  是正常版本的话，就往下进行 兼容已经存在的版本
        const b = lastVer.split('.');
        const b1 = b[0];
        const b3 = b[2];
        if (b3 && b3 != 0 && !Number(b[2])) {
            lastVer = `${Number(b1) + 1}.0.0`;
        }
        return lastVer;
    }
    return vs.pop();
};

// let version = getVersions(['1.0.2-beta.1', '1.2.0', '2.2.99'], app_env);

// console.log(version);

function dumpVersion(version, channel = '', maxV = 99) {
    if (isEnvTest(channel)) {
        const oldV = version;
        let a = oldV.split('.');
        let b = a[2].split('-');
        a[2] = [...b];
        if (a[a.length - 1] >= maxV) {
            a[a.length - 2][0]++;
            a[a.length - 1] = 0;
        } else {
            a[a.length - 1]++;
        }
        a[2] = a[2].join('-');
        return a.join('.');
    }
    const oldV = version;
    let a = oldV.split('.');
    if (a[a.length - 1] >= maxV) {
        a[a.length - 2]++;
        a[a.length - 1] = 0;
    } else {
        a[a.length - 1]++;
    }
    return a.join('.');
}

// const publishTag = getPublishTag(app_env)
// const new_verison = dumpVersion(version, publishTag);

// if(publishTag){
//     console.log('publishTag')
// }else {
//     console.log('np publishTag')
// }
// console.log(new_verison);

const upDatePkg = async () => {
    try {
        const app_env = 'beta';
        const checkMaster = await execa('git', ['checkout', 'master']);
        console.log('master分支检出完毕');
        const versionExeca = await execa('npm', ['info', 'ls-one', 'versions', '--json']);

        let version = getVersions(JSON.parse(versionExeca.stdout), app_env);
        console.log(version);

        const publishTag = getPublishTag(app_env);
        console.log(publishTag);

        const new_version = dumpVersion(version, publishTag);
        console.log(new_version);

        const updateV = await execa('yarn', ['version', '--new-version', new_version]);
        console.log(1,updateV.stdout);

        const tag1 = await execa('git', ['push', '--tags']);
        console.log('tag1创建完毕', tag1.stdout);

        const tag2 = await execa('git', ['push', '--follow-tags']);
        console.log('tag1创建完毕', tag2.stdout);

        if (publishTag) {
            const goPublishTag = execa('npm', ['publish', '--tag', publishTag]);
            console.log('goPublishTag', goPublishTag);
        } else {
            const nPpublishTag = execa('npm', ['publish']);
            console.log('nPpublishTag', nPpublishTag);
        }
    } catch (error) {
        console.log(error)
    }
};
upDatePkg();

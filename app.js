const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
// 减少路径书写
function resolve(dir) {
    return path.join(__dirname, `./${dir}`);
}

function dumpVersion(version, channel = '', maxV = 99) {
    const oldV = version;
    let a = oldV.split('.');
    if (a[a.length - 1] > maxV) {
        a[a.length - 2]++;
        a[a.length - 1] = 0;
    } else {
        a[a.length - 1]++;
    }
    return a.join('.');
}

// 检测环境来对应不同的tag
function publishTag(app_env) {
    let publishTag = '';
    if (isEnvProd(app_env)) {
        publishTag = '';
    }
    if (isEnvTest(app_env)) {
        publishTag = 'beta';
    }
    return publishTag;
}

// 环境检测
const isEnvTest = (app_env) => {
    return app_env === 'beta';
};

const isEnvProd = (app_env) => {
    return app_env === 'prod';
};

const getVersions = (versions, env) => {
    // 没有发布过包的情况
    let version = ''
    if(!versions || !versions.length){
        if(isEnvTest(env)){
            version = `1.0.0-beta.0`
        }else {
            version = '1.0.0'
        }
        return
    }
    if(isEnvTest(env)) {
        const lastVer = versions.includes('beta').pop()
        console.log(lastVer)
    }
    // 发布过包的情况
};

// 区分tag
// 命名
(async function () {
    console.log(process.env.NODE_ENV);
    try {
        const env = process.env.NODE_ENV;
        // const checkMaster = await execFileSync('git', ['checkout', '--track', 'origin/master'], {
        //     encoding: 'utf-8'
        // });
        // const checkMaster = await execFileSync('git', ['checkout', 'master'], {
        //     encoding: 'utf-8'
        // });
        // console.log('master分支检出完毕', checkMaster);
        // 获取环境标识
        const getPublishTag = publishTag(env);
        console.log(getPublishTag);
        const versionList = await JSON.parse(
            execFileSync('npm.cmd', ['info', 'ls-one', 'versions', '--json'], { encoding: 'utf-8' })
        );
        // 版本处理
        getVersions(versionList, env);
        // const code = JSON.parse(fs.readFileSync(`${resolve('package.json')}`, 'utf-8'));
        // console.log('package解析完成');
        // const { version = '1.0.0' } = code || '';
        // if (!versionList) {
        //     version = '1.0.0';
        // }
        // const new_version = dumpVersion(version);
        // console.log('版本号更新完毕', new_version);
        // const updateV = await execFileSync('yarn.cmd', ['version', '--new-version', new_version], {
        //     encoding: 'utf-8'
        // });
        // console.log(updateV);
        // const tag1 = execFileSync('git', ['push', '--tags'], { encoding: 'utf-8' });
        // console.log('tag1创建完毕', tag1);
        // const tag2 = execFileSync('git', ['push', '--follow-tags'], { encoding: 'utf-8' });
        // console.log('tag1创建完毕', tag2);
        // const publish = execFileSync('npm.cmd', ['publish'], { encoding: 'utf-8' });
        // log(chalk.green(`${pkgInfo.name}项目==>包发布完毕${publish}`));
    } catch (error) {
        console.log(error);
    }
})();

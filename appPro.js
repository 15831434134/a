const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
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

/**
 * 切换到master分之
 * 得到最新的版本号
 * 将最新的版本号进行更新
 * 发布标签
 *  */

(async function () {
    try {
        const checkMaster = await execFileSync('git', ['checkout', 'master'], { encoding: 'utf-8' });
        console.log('master分支检出完毕', checkMaster);
        const code = JSON.parse(fs.readFileSync(`${resolve('package.json')}`, 'utf-8'));
        console.log('package解析完成');
        const { version = '1.0.0' } = code || '';
        const new_version = dumpVersion(version);
        console.log('版本号更新完毕', new_version);
        const updateV = await execFileSync('yarn.cmd', ['version', '--new-version', new_version], {
            encoding: 'utf-8'
        });
        console.log(updateV);
        const tag1 = execFileSync('git', ['push', '--tags'], { encoding: 'utf-8' });
        console.log('tag1创建完毕', tag1);
        const tag2 = execFileSync('git', ['push', '--follow-tags'], { encoding: 'utf-8' });
        console.log('tag1创建完毕', tag2);
    } catch (error) {
        console.log(error);
    }
})();

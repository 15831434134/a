const getVersions = (versions, env) => {
    const vs = versions && (Array.isArray(versions) ? versions : [versions]);
    console.log(vs);
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
        return lastVer;
    }
    return vs.pop();

    // 发布过包的情况
};
const isEnvTest = (app_env) => {
    return app_env === 'beta';
};
const isEnvProd = (app_env) => {
    return app_env === 'prod';
};
let a = getVersions(['1.0.1-beta9', '1.2.0', '1.2.0-rx.0'], 'prod');
const b = a.split('.');
const b1 = b[0];
const b3 = b[2];
if (b3 && b3 != 0 && !Number(b[2])) {
    console.log(123);
    a = `${Number(b[0])+1}.0.0`;
}
console.log(a);

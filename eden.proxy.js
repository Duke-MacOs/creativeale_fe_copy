// 配置参考，根证书安装（解决浏览器不信任）=> https://eden.bytedance.net/tools/proxy/usage/installation
// 控制台 => http://127.0.0.1:15323

// NOTE: localhost不能代理到localhost: https://eden.bytedance.net/tools/proxy/faq/options#%E6%88%91%E6%83%B3%E4%BB%A3%E7%90%86%E6%9C%AC%E6%9C%BA%E5%9C%B0%E5%9D%80127001-%E6%88%96-localhost
const remote = ['local.dev'].concat(process.env.EDEN_PROXY ?? []);
const exclude = ['/api', '/static-cloud/invoke', '.*noProxy.*'];

module.exports = {
  urlRewrite: remote.reduce(
    (result, remoteHost) => {
      const https = `https?://${remoteHost}(?!${exclude.join('|')})`;
      const wss = `wss?://${remoteHost}`;
      return Object.assign(result, {
        [https]: `http://127.0.0.1:9010`,
        [wss]: `ws://127.0.0.1:9010`,
      });
    },
    {
      'https?://local.dev/api': 'http://127.0.0.1:9100/api',
    }
  ),
};

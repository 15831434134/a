const webpack = require('webpack')
const path = require('path')
module.exports = {
    entry: {
        app: ['./app.js']
      },
      output: {
        filename: 'a', // 动态链接库输出的文件名称
        path: path.join(__dirname, '../dist/static/js'), // 动态链接库输出路径
      }
}
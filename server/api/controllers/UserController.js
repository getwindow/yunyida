/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var NodeCache = require("node-cache");
var myCache = new NodeCache();

module.exports = {
    login: function (req, res) {
        var userName = req.body.userName || req.query.userName;
        var password = req.body.password || req.query.password;
        User.find({
                //where: {password: EncryptService.Encrypt(password)},
                or: [{userName: userName}, {phoneNumber: userName}]
            })
            .exec(function (err, users) {
                if (err) res.badRequest(err);
                if (users && users.length > 0) {
                    var user = users[0];
                    if (user.password == EncryptService.Encrypt(password)) {
                        res.ok(user);
                    }
                    else {
                        res.serverError({msg: '您输入的密码不正确!'});
                    }
                }
                else {
                    res.serverError({msg: '您的用户名或手机号码不存在!'});
                }
            });
    },
    list: function (req, res) {
        var page = req.body.page;
        var rows = req.body.rows;
        var enterpriseName = req.body.enterpriseName;
        var realName = req.body.realName;
        var phoneNumber = req.body.phoneNumber;
        var userType = req.body.userType || '货主';
        var status = req.body.status;

        var option = {
            userType: userType
        };

        if (enterpriseName) {
            option.enterpriseName = {'contains': enterpriseName};
        }

        if (realName) {
            option.realName = {'contains': realName};
        }

        if (phoneNumber) {
            option.phoneNumber = {'contains': phoneNumber};
        }

        if (status) {
            option.status = status;
        }

        User.count(option).exec(function countCB(err, count) {
            if (err) res.badRequest(err);
            if (count && count > 0) {
                User.find(option)
                    .sort('updatedAt DESC')
                    .paginate({page: page, limit: rows})
                    .exec(function (err, data) {
                        if (err) res.badRequest(err);
                        res.ok({body: data, count: count});
                    });
            }
            else {
                res.ok({body: [], count: 0});
            }
        });
    },
    getCarrier: function (req, res) {
        var sCityCode = req.body.sCityCode || req.query.sCityCode;
        var eCityCode = req.body.eCityCode || req.query.eCityCode;
        var eStreet = req.body.eStreet || req.query.eStreet;

        var sql = " SELECT u.* FROM `user` AS u";
        sql += " INNER JOIN enterprise AS e ON e.`user` = u.userId";
        sql += " INNER JOIN goodsline AS l ON l.`user` = u.userId";
        sql += " WHERE u.userType = '物流企业'";
        sql += " AND e.businessType LIKE '%零担%'";
        sql += " AND l.eCity != '全国'";
        sql += " AND l.sCityCode LIKE '%" + sCityCode.toString().substr(0, 4) + "%'";
        sql += " AND (l.eCityCode = '" + eCityCode + "' OR l.eCityCode = '" + eCityCode.toString().substr(0, 4) + "00')";
        if (eStreet) {
            sql += " OR l.eStreet = '" + eStreet + "'";
        }
        else {
            sql += " AND (l.eStreet IS NULL OR l.eStreet = '')";
        }
        sql += " ORDER BY  l.eCityCode DESC";

        User.query(sql, function (err, results) {
                if (err) res.badRequest(err);
                if (results && results.length > 0) {
                    var unique = {};
                    results.forEach(function (user) {
                        unique[JSON.stringify(user)] = user
                    });
                    results = Object.keys(unique).map(function (u) {
                        return JSON.parse(u)
                    });
                    res.ok(results);
                }
                else {
                    res.ok([]);
                }
            }
        );
    },
    update: function (req, res) {
        var data_from = req.params.all();
        User.update({userId: data_from.userId}, data_from)
            .exec(function (err, user) {
                if (err) res.badRequest(err);
                res.ok(user[0]);
            });
    },
    checkIsExist: function (req, res) {
        var userName = req.body.userName || req.query.userName;
        User.find({
                or: [{userName: userName}, {phoneNumber: userName}]
            })
            .exec(function (err, users) {
                if (err) res.badRequest(err);
                if (users && users.length > 0) {
                    res.serverError({msg: '用户或手机号码已存在!'});
                }
                else {
                    res.ok({msg: 'ok'});
                }
            });
    },
    register: function (req, res) {
        var data_from = req.params.all();
        User.create(data_from).exec(function (err, user) {
            if (err) res.badRequest(err);
            var goodsAddress = {
                consignor: user.realName,//发/收货人
                phoneNumber: user.phoneNumber,//手机号码
                city: user.city,//所在城市
                cityCode: user.cityCode,//所在城市代码
                street: user.street,//街道
                address: user.address,//详细地址
                lng: user.lng,//经度
                lat: user.lat,//纬度
                isDefault: true,//是否默认发货地址
                type: '发货',//收发货地址类型
                user: user.userId
            };
            GoodsAddress.create(goodsAddress).exec(function (err) {
                if (err) res.badRequest(err);
            });
            res.ok(user);
        })
    },
    restPwd: function (req, res) {
        var data_from = req.params.all();
        User.findOne({phoneNumber: data_from.phoneNumber})
            .exec(function (err, user) {
                if (err) res.badRequest(err);
                user.password = EncryptService.Encrypt(data_from.password);
                user.save(function (err, user) {
                    if (err) res.badRequest(err);
                    res.ok(user);
                })
            });
    },
    changePwd: function (req, res) {
        var data_from = req.params.all();
        User.findOne({userId: data_from.userId})
            .exec(function (err, user) {
                if (err) res.badRequest(err);
                if (user.password == EncryptService.Encrypt(data_from.oldPassword)) {
                    user.password = EncryptService.Encrypt(data_from.newPassword);
                    user.save(function (err, user) {
                        if (err) res.badRequest(err);
                        res.ok(user);
                    })
                }
                else {
                    res.badRequest('您输入的原始密码不正确');
                }
            });
    },
    getRegValidCode: function (req, res) {
        var phoneNumber = req.body.phoneNumber || req.query.phoneNumber;
        SMSService.SendRegCode(phoneNumber, function (code) {
            if (code) {
                myCache.set(phoneNumber, code);
                res.ok({validCode: code});
            }
        });
    },
    getFindValidCode: function (req, res) {
        var phoneNumber = req.body.phoneNumber || req.query.phoneNumber;
        SMSService.SendFindCode(phoneNumber, function (code) {
            if (code) {
                myCache.set(phoneNumber, code);
                res.ok({validCode: code});
            }
        });
    },
    checkValidCode: function (req, res) {
        var phoneNumber = req.body.phoneNumber || req.query.phoneNumber;
        var validCode = req.body.validCode || req.query.validCode;

        myCache.get( phoneNumber, function( err, value ){
            if( !err ){
                if(value == undefined){
                    res.serverError({msg: 'no'});
                }else{
                    if (value == validCode) {
                        res.ok({msg: 'ok'});
                    }
                    else {
                        res.serverError({msg: 'no'});
                    }
                }
            }
            else{
                res.serverError({msg: 'no'});
            }
        });
    },
    /**
     * 上传头像
     *
     * (POST /user/uploadAvatar)
     */
    uploadAvatar: function (req, res) {
        req.file('avatar').upload({
            dirname: sails.config.appPath + '/assets/images',
            maxBytes: 10000000            // 允许最大上传的文件大小为10MB
        }, function whenDone(err, uploadedFiles) {
            if (err) {
                return res.negotiate(err);
            }

            // 如果文件上传不成功,返回一个错误.003
            if (uploadedFiles.length === 0) {
                return res.badRequest('文件上传失败');
            }

            var avatarId = uploadedFiles[0].fd;
            avatarId = avatarId.replace(sails.config.appPath + '\\assets\\images\\', '');
            avatarId = avatarId.replace(sails.config.appPath + '/assets/images/', '');

            return res.send(avatarId.toLowerCase());
        });
    },
    /**
     * 通过头像资源Id获取图片
     *
     * (GET /user/avatar/:id)
     */
    avatar: function (req, res) {
        req.validate({
            id: 'string'
        });

        var avatarFd = sails.config.appPath + '/assets/images/' + req.param('id');
        var skipperDisk = require('skipper-disk');
        var fileAdapter = skipperDisk(/* optional opts */);

        // Stream the file down
        fileAdapter.read(avatarFd)
            .on('error', function (err) {
                return res.serverError(err);
            })
            .pipe(res);
    }
};


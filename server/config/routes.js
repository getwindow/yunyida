/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
     * etc. depending on your default view engine) your home page.              *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    '/': {
        view: 'homepage'
    },

    /***************************************************************************
     *                                                                          *
     * 城市数据相关API...                                                *
     *                                                                          *
     ***************************************************************************/
    '/areas/getCityData': 'AreasController.getCityData',
    '/areas/getStreetData': 'AreasController.getStreetData',

    /***************************************************************************
     *                                                                          *
     * 用户登录,注册等相关API...                                                *
     *                                                                          *
     ***************************************************************************/
    '/user/login': 'UserController.login',
    '/user/checkIsExist': 'UserController.checkIsExist',
    'post /user/register': 'UserController.register',
    'post /user/restPwd': 'UserController.restPwd',
    'post /user/changePwd': 'UserController.changePwd',
    'post /user/update': 'UserController.update',
    'post /user/uploadAvatar': 'UserController.uploadAvatar',
    '/user/avatar/:id': 'UserController.avatar',
    '/user/getValidCode': 'UserController.getValidCode',
    '/user/checkValidCode': 'UserController.checkValidCode',

    /***************************************************************************
     *                                                                          *
     * 货源相关API...                                                            *
     *                                                                          *
     ***************************************************************************/
    'post /goods/add': 'GoodsController.add',

    /***************************************************************************
     *                                                                          *
     * 收发货地址相关API...                                                            *
     *                                                                          *
     ***************************************************************************/
    '/goodsAddress/userGoodsAddress': 'GoodsAddressController.userGoodsAddress',
    'post /goodsAddress/add': 'GoodsAddressController.add',
    'post /goodsAddress/update': 'GoodsAddressController.update',
    'post /goodsAddress/deleteGoodsAddress': 'GoodsAddressController.deleteGoodsAddress',
    'post /goodsAddress/defaultGoodsAddress': 'GoodsAddressController.defaultGoodsAddress',


    /***************************************************************************
     *                                                                          *
     * 订单相关API...                                                            *
     *                                                                          *
     ***************************************************************************/
    '/order/userOrder': 'GoodsOrderController.userOrder',
    'post /order/cancelOrder': 'GoodsOrderController.cancelOrder',
    'post /order/refreshOrder': 'GoodsOrderController.refreshOrder',
    'post /order/deleteOrder': 'GoodsOrderController.deleteOrder',
    'post /order/evaluateOrder': 'GoodsOrderController.evaluateOrder',

    /***************************************************************************
     *                                                                          *
     * 物流企业相关API...                                                            *
     *                                                                          *
     ***************************************************************************/
    'post /enterprise/register': 'EnterpriseController.register',

    /***************************************************************************
     *                                                                          *
     * 司机相关API...                                                            *
     *                                                                          *
     ***************************************************************************/
    'post /driver/register': 'DriverController.register',

    /***************************************************************************
     *                                                                          *
     * 车辆相关API...                                                            *
     *                                                                          *
     ***************************************************************************/
    'post /car/upload': 'CarController.upload',
    '/car/avatar/:id': 'CarController.avatar',
};

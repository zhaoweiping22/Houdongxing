/**
 * Notes: 活动后台管理模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-24 07:48:00 
 */

const BaseBiz = require('../../../comm/biz/base_biz.js');
const ActivityBiz = require('./activity_biz.js');
const projectSetting = require('../public/project_setting.js');
const validate = require('../../../helper/validate.js');
const PublicBiz = require('../../../comm/biz/public_biz.js');
const cloudHelper = require('../../../helper/cloud_helper.js');
const cacheHelper = require('../../../helper/cache_helper.js');
const pageHelper = require('../../../helper/page_helper.js');
const formSetHelper = require('../../../cmpts/public/form/form_set_helper.js');

class AdminActivityBiz extends BaseBiz { 
	

	static selectMethod(e, that) {

	} 


	static initFormData(id = '') {
		let cateIdOptions = ActivityBiz.getCateList();

		let region = cacheHelper.get('CACHE_REGION', ['北京市', '北京市']);

		return {
			id,

			cateIdOptions,
			fields: projectSetting.ACTIVITY_FIELDS,
			fields2: projectSetting.ACTIVITY_FIELDS2,

			formTitle: '',
			formCateId: (cateIdOptions.length == 1) ? cateIdOptions[0].val : '',
			formOrder: 9999,

			formMaxCnt: 50,
			formStart: '',
			formEnd: '',
			formStop: '',

			formMethod: 0,
			formAddress: '',
			formAddressGeo: {
				address: '',
				latitude: 0,
				longitude: 0,
				name: ''
			},

			formCheckSet: 0,
			formCancelSet: 1,
			formIsMenu: 0,

			formForms: [{ mark: 'city', title: '城市', type: 'area', val: region, ext: { city: true } }],

			formJoinForms: formSetHelper.initFields(projectSetting.ACTIVITY_JOIN_FIELDS),
		}

	}

	static async loadActivityDetail(that, route = 'admin') {
		let id = that.data.id;
		if (!id) return;

		if (!that.data.isLoad) that.setData(AdminActivityBiz.initFormData(id)); // 初始化表单数据

		let params = {
			id
		};
		let opt = {
			title: 'bar'
		};
		let activity = await cloudHelper.callCloudData(route + '/activity_detail', params, opt);
		if (!activity) {
			that.setData({
				isLoad: null
			})
			return;
		};

		if (!Array.isArray(activity.ACTIVITY_JOIN_FORMS) || activity.ACTIVITY_JOIN_FORMS.length == 0)
			activity.ACTIVITY_JOIN_FORMS = projectSetting.ACTIVITY_JOIN_FIELDS;


		that.setData({
			isLoad: true,

			fields: projectSetting.ACTIVITY_FIELDS,
			fields2: projectSetting.ACTIVITY_FIELDS2,

			formTitle: activity.ACTIVITY_TITLE,
			formCateId: activity.ACTIVITY_CATE_ID,
			formOrder: activity.ACTIVITY_ORDER,

			formMaxCnt: activity.ACTIVITY_MAX_CNT,
			formStart: activity.ACTIVITY_START,
			formEnd: activity.ACTIVITY_END,
			formStop: activity.ACTIVITY_STOP,

			formMethod: activity.ACTIVITY_METHOD,
			formAddress: activity.ACTIVITY_ADDRESS,
			formAddressGeo: activity.ACTIVITY_ADDRESS_GEO,

			formCheckSet: activity.ACTIVITY_CHECK_SET,
			formCancelSet: activity.ACTIVITY_CANCEL_SET,
			formIsMenu: activity.ACTIVITY_IS_MENU,

			formForms: activity.ACTIVITY_FORMS,
			formJoinForms: formSetHelper.initFields(activity.ACTIVITY_JOIN_FORMS),

		});

	}
 

	static selectLocation(that) {
		let callback = function (res) {
			if (!res || !res.name || !res.address || !res.latitude || !res.longitude)
				return;

			let formAddress = res.address + '  ' + res.name;

			let formAddressGeo = {};
			formAddressGeo.name = res.name;
			formAddressGeo.address = res.address;
			formAddressGeo.latitude = res.latitude;
			formAddressGeo.longitude = res.longitude;
			that.setData({
				formAddressGeo,
				formAddress
			});
		}
		if (that.data.formAddressGeo && that.data.formAddressGeo.latitude > 0) {
			wx.chooseLocation({
				latitude: that.data.formAddressGeo.latitude,
				longitude: that.data.formAddressGeo.longitude,
				success: function (res) {
					callback(res);
				}
			})
		} else {
			wx.chooseLocation({
				success: function (res) {
					callback(res);
				},
				fail: function (err) {
					console.log(err);
				}
			})
		}
	} s

}
AdminActivityBiz.CHECK_FORM = {
	title: 'formTitle|must|string|min:2|max:50|name=标题',
	cateId: 'formCateId|must|id|name=分类',
	order: 'formOrder|must|int|min:0|max:9999|name=排序号',

	maxCnt: 'formMaxCnt|must|int|name=人数上限',
	start: 'formStart|must|string|name=活动开始时间',
	end: 'formEnd|must|string|name=活动结束时间',
	stop: 'formStop|must|string|name=报名截止时间',

	method: 'formMethod|must|int|name=活动方式',
	address: 'formAddress|false|string|name=活动地点',
	addressGeo: 'formAddressGeo|must|object|name=活动地点GEO',

	checkSet: 'formCheckSet|must|int|name=审核设置',
	cancelSet: 'formCancelSet|must|int|name=取消设置',
	isMenu: 'formIsMenu|must|int|name=是否展示名单',
	forms: 'formForms|array',
	joinForms: 'formJoinForms|must|array|name=用户报名资料设置',
};

module.exports = AdminActivityBiz;
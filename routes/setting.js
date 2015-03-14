var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

/* GET set info page */
router.get('/', function(req, res, next) { 
	User.findById(req.session.user._id, 'info', function(err, data) { 
		if(err) { 
			return res.render('error', { message: '系统出错，请重试' });
		}
		else { 
			return res.render('setting', { info: data.info });
		}
	});
});

/* GET set pwd page */
router.get('/pwd', function(req, res, next) { 
	res.render('pwd', {});
});

/* GET set avatar page */
router.get('/avatar', function(req, res, next) { 
	res.render('avatar', {});
});

/* POST change info */
router.post('/', function(req, res, next) { 
	User.findOne({ 'info.nickname': req.body.nickname }, function(err, data) { 
		if(data != null && data.info.nickname != req.session.user.nickname) { 
			return res.render('error', { message: '昵称已存在'});
		}
		else { 
			User.update({ _id:req.session.user._id }, { 
				$set: { 
					info: { 
						nickname: req.body.nickname,
						sex: req.body.sex,
						intro: req.body.intro
					}
				}
			}, function(err) { 
				if(err) { 
					return res.render('error', { message: '修改失败，请重试' });
				}
				else { 
					req.session.user.nickname = req.body.nickname;
					req.session.user.intro = req.body.intro;
					return res.redirect('/setting');
				}
			});
		}
	});
});

/* POST change pwd */
router.post('/pwd', function(req, res, next) { 
	User.findById(req.session.user._id, 'pwd', function(err, data) { 
		if(err) { 
			return res.render('error', { message: '系统错误，请重试' });
		}
		else { 
			var md5 = crypto.createHash('md5');
			md5.update(req.body.oldpwd);
			var md5oldpwd = md5.digest('hex');
			if(data.pwd != md5oldpwd) { 
				return res.render('error', { message: '原密码错误' });
			}
			else { 
				if(req.body.newpwd != req.body.chkpwd) { 
					return res.render('error', { message: '两次密码不一致' });
				}
				else { 
					md5 = crypto.createHash('md5');
					md5.update(req.body.newpwd);
					var md5newpwd = md5.digest('hex');
					User.update({ _id:req.session.user._id }, { 
						$set: { 
							pwd: md5newpwd
						}
					}, function(err) { 
						if(err) { 
							return res.render('error', { message: '修改失败，请重试' });
						}
						else { 
							return res.redirect('/setting/pwd');
						}
					});
				}
			}
		}
	});
});

module.exports = router;

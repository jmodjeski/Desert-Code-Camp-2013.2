
exports = module.exports = function(req, res, next){

	res.model.id = req.params.id;
	res.render('meeting', res.model);
};
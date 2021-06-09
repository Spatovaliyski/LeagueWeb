jQuery(document).ready(function($) {
	"use strict";

	console.log('test');

	$('body').addClass('loaded');


	$('.region-picker li').click(function(){
		if ($(this).hasClass('is-active')) {
			$('.region-picker').addClass('is-visible');
			$('.region-picker li').removeClass('is-active');
		} else {
			$('region-picker li').removeClass('is-active');
			$(this).addClass('is-active');
			$('.region-picker').removeClass('is-visible')
		}
	});

	$('.login-button').click(function(){
		$('body').addClass('logging');
	});
});
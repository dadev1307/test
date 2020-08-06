function initTimeData(size, firstWidth = 100, lastWidth = 100) {
	const midWidth = 100 / size;
	const fWidth = (midWidth * firstWidth) / 100;
	let lWidth = (midWidth * lastWidth) / 100;
	let oldWidth;

	if(size > 2) {
		oldWidth = (100 - fWidth - lWidth) / (size - 2);
	}else {
		if(fWidth < 50) {
			lWidth = 100 - fWidth; 
		}
	}
	
	return Array(size).fill('').map((_, index) => {
		return {
			isActive: ko.observable(false),
			width: index === 0 ? fWidth : (index === (size - 1) ? lWidth : oldWidth)
		}
	});
}

function timeToSizeList(start, stop) {
	if (start - stop < 0) {
		return Math.abs(start - stop);
	} else {
		return Math.abs(start - stop - 24);
	}
}

function getHourAndMin(str) {
	const [h, m] = str.split(":");
	return { h, m };
}

function hoursToString(h) {
	if(h < 10) {
		return "0"+h;
	}
	return h.toString();
}

function generateRangeTime(start, stop) {
	const size = timeToSizeList(start.h, stop.m > 0 ? +stop.h + 1 : stop.h);
	let date = new Date();
	date.setHours(start.h,start.m);
	let i = 0;
	let arr = [];
	while(i < size) {
		const obj = {
			h: hoursToString(date.getHours())
		}
		if(i === 0) {
			obj.m = start.m;
		} else if(i === size) {
			obj.m = stop.m;
		}else {
			obj.m = "00";
		}
		arr = [...arr, obj];
		date.setHours(date.getHours() + 1);
		i++
	}
	return arr;
}

function isTime(time) {
	const reg = new RegExp('^([01][0-9]|2[0-3]):[0-5][0-9]$');
	return reg.test(time);
}

ko.bindingHandlers.inputmask = {
	init: function(element, valueAccessor, allBindingsAccessor) {
		var mask = valueAccessor();
		var observable = mask.value;
		$(element).on('focus', function() {
			if ($(element).inputmask('isComplete')) {
				observable("")
			}
		})

		if (ko.isObservable(observable)) {


			$(element).on('focusout change', function() {
				if ($(element).inputmask('isComplete')) {
					observable($(element).val());
				} else {
					observable("00:00");
				}
			});
		}
		$(element).inputmask({regex: "^([01][0-9]|2[0-3]):[0-5][0-9]$"});

	},
	update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

		var mask = valueAccessor();
		var observable = mask.value;
		if (ko.isObservable(observable)) {
			var valuetoWrite = observable();
			$(element).val(valuetoWrite);
		}
	}
};

function PageModel() {
	var self = this;
	self.startTime = ko.observable("00:00");
	self.stopTime = ko.observable("00:00");

	self.firstWidth = ko.computed(function() {
		let { m } = getHourAndMin(this.startTime());
		if (m > 0) {
			return (100 / 60 * m);
		}
		return 100;
	}, this);

	self.lastWidth = ko.computed(function() {
		let { m } = getHourAndMin(this.stopTime());
		if (m > 0) {
			return (100 / 60 * m);
		}
		return 100;
	}, self);

	self.getModelByTime = function(start, stop) {
		let sizeTime = timeToSizeList(start.h, stop.m > 0 ? +stop.h + 1 : stop.h);
		let days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(item => ({ name: item, time: ko.observableArray(initTimeData(sizeTime, self.firstWidth(), self.lastWidth())) }));
		return days;
	}

	self.toggleIsActiveItem = function(item) {
		item.isActive(!item.isActive());
	}

	self.setAllStatus = function(status) {
		self.items().map(item => {
			item.time().map(it => {
				it.isActive(status);
			})
		})
	}

	self.setNewTime = function() {
		self.items(self.getModelByTime(getHourAndMin(self.startTime()), getHourAndMin(self.stopTime())));
		self.header(generateRangeTime(getHourAndMin(self.startTime()), getHourAndMin(self.stopTime())));
	}

	self.steps = ko.observableArray([
		{
			name: 'Тип предприятия',
			step: 1,
			status: ko.observable('active')
		},
		{
			name: 'Категории',
			step: 2,
			status: ko.observable('default')
		},
		{
			name: 'График работы',
			step: 3,
			status: ko.observable('default')
		},
		{
			name: 'Оборот и нагрузка',
			step: 4,
			status: ko.observable('default')
		},
		{
			name: 'Должности',
			step: 5,
			status: ko.observable('default')
		},
		{
			name: 'Тип нагрузки',
			step: 6,
			status: ko.observable('default')
		},
	]);

	self.activeStep = ko.observable(3);
	self.stepTo = function(to) {
		const sizeSteps = self.steps().length;
		if(to){
			if(self.activeStep() < sizeSteps) {
				self.activeStep(self.activeStep() + 1)
			}
		} else {
			if(self.activeStep() > 1) {
				self.activeStep(self.activeStep() - 1)
			}
		}
	}

	self.stepItems = ko.computed(function(){
		this.steps().reduce((acc,item) => {
			if(item.step === self.activeStep()) {
				item.status('active');
				return true;
			}
			if(acc) {
				item.status('default');
			}else {
				item.status('behold');
			}

			return acc;
		}, false)
		return this.steps();
	},self)

	self.items = ko.observable(self.getModelByTime(getHourAndMin(self.startTime()), getHourAndMin(self.stopTime())));
	self.header = ko.observableArray(generateRangeTime(getHourAndMin(self.startTime()), getHourAndMin(self.stopTime())))
}


ko.applyBindings(new PageModel(), document.getElementById('page'));
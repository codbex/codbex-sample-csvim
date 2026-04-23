angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-csvim/gen/sample/api/2/CityController.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'City successfully created';
		let propertySuccessfullyUpdated = 'City successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'City Details',
			create: 'Create City',
			update: 'Update City'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-sample-csvim:sample-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-sample-csvim:sample-model.defaults.formHeadSelect', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
			$scope.formHeaders.create = LocaleService.t('codbex-sample-csvim:sample-model.defaults.formHeadCreate', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
			$scope.formHeaders.update = LocaleService.t('codbex-sample-csvim:sample-model.defaults.formHeadUpdate', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-sample-csvim:sample-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-sample-csvim:sample-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-csvim-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === '2' && e.view === 'City' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsCountry = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsCountry = data.optionsCountry;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsCountry = data.optionsCountry;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsCountry = data.optionsCountry;
				$scope.action = 'update';
			});
		}});

		$scope.serviceCountry = '/services/ts/codbex-sample-csvim/gen/sample/api/1/CountryController.ts';


		$scope.$watch('entity.Country', (newValue, oldValue) => {
			if (newValue !== undefined && newValue !== null) {
				$http.get($scope.serviceCountry + '/' + newValue).then((response) => {
					let valueFrom = response.data.Id;
					$http.post('/services/ts/codbex-sample-csvim/gen/sample/api/1/CountryController.ts/search', {
						conditions: [
							{ propertyName: 'Country', operator: 'EQ', value: valueFrom }
						]
					}).then((response) => {
						$scope.optionsCountry = response.data.map(e => ({
							value: e.Id,
							text: e.Name
						}));
						if ($scope.action !== 'select' && newValue !== oldValue) {
							if ($scope.optionsCountry.length == 1) {
								$scope.entity.Country = $scope.optionsCountry[0].value;
							} else {
								$scope.entity.Country = undefined;
							}
						}
					}, (error) => {
						console.error(error);
					});
				}, (error) => {
					console.error(error);
				});
			}
		});
		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCreate', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCreate', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-sample-csvim.2.City.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createCountry = () => {
			Dialogs.showWindow({
				id: 'Country-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshCountry = () => {
			$scope.optionsCountry = [];
			$http.get('/services/ts/codbex-sample-csvim/gen/sample/api/1/CountryController.ts').then((response) => {
				$scope.optionsCountry = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Country',
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});
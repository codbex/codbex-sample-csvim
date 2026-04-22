angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-csvim/gen/sample/api/1/CountryController.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Country successfully created';
		let propertySuccessfullyUpdated = 'Country successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Country Details',
			create: 'Create Country',
			update: 'Update Country'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-sample-csvim:sample-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-sample-csvim:sample-model.defaults.formHeadSelect', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)' });
			$scope.formHeaders.create = LocaleService.t('codbex-sample-csvim:sample-model.defaults.formHeadCreate', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)' });
			$scope.formHeaders.update = LocaleService.t('codbex-sample-csvim:sample-model.defaults.formHeadUpdate', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-sample-csvim:sample-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-sample-csvim:sample-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-csvim-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === '1' && e.view === 'Country' && e.type === 'entity');
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
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.1.Country.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.1.Country.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.1.Country.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.1.Country.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.action = 'update';
			});
		}});


		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.1.Country.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.1.Country.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.COUNTRY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.COUNTRY'),
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCreate', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.1.Country.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.1.Country.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.COUNTRY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.COUNTRY'),
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCreate', { name: '$t(codbex-sample-csvim:sample-model.t.COUNTRY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-sample-csvim.1.Country.clearDetails');
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
		

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//


		//----------------Dropdowns-----------------//	
	});
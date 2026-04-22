angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CityController.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
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

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsCountry = params.optionsCountry;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.Entities.City.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCreate', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-sample-csvim.Entities.City.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToUpdate', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceCountry = '/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CountryController.ts';
		
		$scope.optionsCountry = [];
		
		$http.get('/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CountryController.ts').then((response) => {
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

		$scope.$watch('entity.Country', (newValue, oldValue) => {
			if (newValue !== undefined && newValue !== null) {
				$http.get($scope.serviceCountry + '/' + newValue).then((response) => {
					let valueFrom = response.data.Id;
					$http.post('/services/ts/codbex-sample-csvim/gen/sample/api/Entities/CountryController.ts/search', {
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

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'City-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});
angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-sample-csvim/gen/sample/api/2/CityController.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete City? This action cannot be undone.',
			deleteTitle: 'Delete City?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-sample-csvim:sample-model.defaults.yes');
			translated.no = LocaleService.t('codbex-sample-csvim:sample-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-sample-csvim:sample-model.defaults.deleteTitle', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
			translated.deleteConfirm = LocaleService.t('codbex-sample-csvim:sample-model.messages.deleteConfirm', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)' });
		});
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-sample-csvim-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === '2' && e.view === 'City' && (e.type === 'page' || e.type === undefined));
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.selectedEntity = null;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.entityCreated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.entityUpdated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-sample-csvim.2.City.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {
					$filter: {}
				};
			}
			$scope.selectedEntity = null;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$filter.offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$filter.limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$filter.offset = 0;
					filter.$filter.limit = $scope.dataPage * $scope.dataLimit;
				}

				EntityService.search(filter).then((response) => {
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
						message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToLF', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
					message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToCount', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.entitySelected', data: {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsCountry: $scope.optionsCountry,
			}});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			$scope.action = 'create';

			Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.createEntity', data: {
				entity: {},
				optionsCountry: $scope.optionsCountry,
			}});
		};

		$scope.updateEntity = () => {
			$scope.action = 'update';
			Dialogs.postMessage({ topic: 'codbex-sample-csvim.2.City.updateEntity', data: {
				entity: $scope.selectedEntity,
				optionsCountry: $scope.optionsCountry,
			}});
		};

		$scope.deleteEntity = () => {
			let id = $scope.selectedEntity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-sample-csvim.2.City.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-sample-csvim:sample-model.t.CITY'),
							message: LocaleService.t('codbex-sample-csvim:sample-model.messages.error.unableToDelete', { name: '$t(codbex-sample-csvim:sample-model.t.CITY)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'City-filter',
				params: {
					entity: $scope.filterEntity,
					optionsCountry: $scope.optionsCountry,
				},
			});
		};

		//----------------Dropdowns-----------------//
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

		$scope.optionsCountryValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsCountry.length; i++) {
				if ($scope.optionsCountry[i].value === optionKey) {
					return $scope.optionsCountry[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});

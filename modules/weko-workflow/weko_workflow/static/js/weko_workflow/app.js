require([
  'jquery',
  'bootstrap'
], function () {
  $('#weko_id_hidden').hide();
  $("#item-type-lists").change(function (ev) {
    window.location.href = '/items/' + $(this).val();
  });
  $("#btnModalClose").click(function () {
    //Process close 'Add Author' or 'Import Author' modal.
    window.appAuthorSearch.namespace.isCloseAuthorModal();
  });
  $("#meta-search-close").click(function () {
    $('#meta-search').modal('toggle');
    $("div.modal-backdrop").remove();
  });
});

var item_title_key = '';

/**
 * Custom bs-datepicker.
 * Default bs-datepicker: just support one pattern for input.
 * Custom bs-datepicker: support validate three pattern.
 * Used way:
 *  templateUrl: /static/templates/weko_deposit/datepicker_multi_format.html
 *  customFormat: enter your pattern.
 *    if it none, pattern are yyyy-MM-dd, yyyy-MM, yyyy.
*/
var Pattern = {
  yyyy: '\\d{4}',
  MM: '(((0)[1-9])|((1)[0-2]))',
  dd: '([0-2][0-9]|(3)[0-1])',
  sep: '(-)'
}
var Format = {
  yyyyMMdd: '^(' + Pattern.yyyy + Pattern.sep +
    Pattern.MM + Pattern.sep + Pattern.dd + ')$',
  yyyyMM: '^(' + Pattern.yyyy + Pattern.sep + Pattern.MM + ')$',
  yyyy: '^(' + Pattern.yyyy + ')$',
}
var CustomBSDatePicker = {
  option: {
    element: undefined,
    defaultFormat: Format.yyyyMMdd + '|' + Format.yyyyMM + '|' + Format.yyyy,
    cls: 'multi_date_format'
  },
  /**
   * Clear validate status for this element.
  */
  init: function () {
    let $element = $(CustomBSDatePicker.option.element);
    let $this_parent = $element.parent().parent();
    $element.removeClass('ng-invalid ng-invalid-date ng-invalid-parse');
    $element.next().next().addClass('hide');
    $this_parent.removeClass('has-error');
  },
  /**
   * Get format from defined user on form schema.
   * If user don't defined, this pattern get default pattern.
   * Default pattern: option.defaultFormat.
   * @return {String} return pattern.
  */
  getPattern: function () {
    let def_pattern = CustomBSDatePicker.option.defaultFormat;
    let $element = $(CustomBSDatePicker.option.element);
    let pattern = $element.data('custom-format');
    return (pattern.length == 0) ? def_pattern : pattern;
  },
  /**
   * Check data input valid with defined pattern.
   * @return {Boolean} return true if value matched
  */
  isMatchRegex: function () {
    let $element = $(CustomBSDatePicker.option.element);
    let val = $element.val();
    let pattern = CustomBSDatePicker.getPattern();
    let reg = new RegExp(pattern);
    return reg.test(val);
  },
  /**
   * Check input required.
   * @return {Boolean} return true if input required
  */
  isRequired: function () {
    let $lement = $(CustomBSDatePicker.option.element);
    let $this_parent = $lement.parent().parent();
    let label = $this_parent.find('label');
    return label.hasClass('field-required');
  },
  /**
  * Get the number of days in any particular month
  * @param  {number} m The month (valid: 0-11)
  * @param  {number} y The year
  * @return {number}   The number of days in the month
  */
  daysInMonth: function (m, y) {
    switch (m) {
      case 1:
        return (y % 4 == 0 && y % 100) || y % 400 == 0 ? 29 : 28;
      case 8: case 3: case 5: case 10:
        return 30;
      default:
        return 31
    }
  },
  /**
  * Check if a date is valid
  * @param  {number}  d The day
  * @param  {number}  m The month
  * @param  {number}  y The year
  * @return {Boolean}   Returns true if valid
  */
  isValidDate: function (d, m, y) {
    let month = parseInt(m, 10) - 1;
    let checkMonth = month >= 0 && month < 12;
    let checkDay = d > 0 && d <= CustomBSDatePicker.daysInMonth(month, y);
    return checkMonth && checkDay;
  },
  /**
   * Check all validate for this.
   * All validation valid => return true.
   * @return {Boolean} Returns true if valid
  */
  isValidate: function () {
    let $element = $(CustomBSDatePicker.option.element);
    let val = $element.val();
    if (val.length == 0) {
      //Required input invalid.
      if (CustomBSDatePicker.isRequired()) return false;
    } else {
      //Data input is not match with defined pattern.
      if (!CustomBSDatePicker.isMatchRegex()) return false;
      //Check day by month and year.
      let arr = val.split('-');
      if (arr.length == 3 && !CustomBSDatePicker.isValidDate(arr[2], arr[1], arr[0])) return false;
    }
    return true;
  },
  /**
   * Check validate and apply css for this field.
  */
  validate: function () {
    let $element = $(CustomBSDatePicker.option.element);
    let $this_parent = $element.parent().parent();
    if (!CustomBSDatePicker.isValidate()) {
      $element.next().next().removeClass('hide');
      $this_parent.addClass('has-error');
    }
  },
  /**
   * This is mean function in order to validate.
   * @param {[type]} element date field
  */
  process: function (element) {
    CustomBSDatePicker.option.element = element;
    CustomBSDatePicker.init();
    CustomBSDatePicker.validate();
  },
  /**
  * Init attribute of model object if them undefine.
  * @param  {[object]}  model
  * @param  {[object]}  element is date input control.
  */
  initAttributeForModel: function (model, element) {
    if($(element).val().length == 0) return;
    let ng_model = $(element).attr('ng-model').replace(/']/g, '');
    let arr = ng_model.split("['");
    //Init attribute of model object if them undefine.
    let str_code = '';
    $.each(arr, function (ind_01, val_02) {
      str_code += (ind_01 == 0) ? val_02 : "['" + val_02 + "']";
      let chk_str_code = '';
      if (ind_01 != arr.length - 1) {
        chk_str_code = "if(!" + str_code + ") " + str_code + "={};";
      }
      eval(chk_str_code);
    });
  },
  /**
  * Excute this function before 'Save' and 'Next' processing
  * Get data from fields in order to fill to model.
  * @param  {[object]}  model
  * @param  {[Boolean]}  reverse
  */
  setDataFromFieldToModel: function (model, reverse) {
    let cls = CustomBSDatePicker.option.cls;
    let element_arr = $('.' + cls);
    $.each(element_arr, function (ind, val) {
      CustomBSDatePicker.initAttributeForModel(model, val);
      if (reverse) {
        //Fill data from model to fields
        str_code = "$(val).val(" + $(val).attr('ng-model') + ")";
        try {
          eval(str_code);
        } catch (e) {
          // If the date on model is undefined, we can safetly ignore it.
          if (!e instanceof TypeError) {
            throw e;
          }
        }
      } else {
        //Fill data from fields to model
        str_code = 'if ($(val).val().length != 0) {' + $(val).attr('ng-model') + '=$(val).val()}';
        eval(str_code);
      }
    });
  },
  /**
   * Get date fields name which invalid.
   * @return {array} Returns name list.
  */
  getInvalidFieldNameList: function () {
    let cls = CustomBSDatePicker.option.cls;
    let element_arr = $('.' + cls);
    let result = [];
    $.each(element_arr, function (ind, val) {
      let $element = $(val);
      let $parent = $element.parent().parent();
      if ($parent.hasClass('has-error')) {
        let name = $element.attr('name');
        let label = $("label[for=" + name + "]").text().trim();
        result.push(label);
      }
    });
    return result;
  },
  /**
   * If input empty, this attribute delete.
   * Fix bug: not enter data for date field.
  */
  removeLastAttr: function(model){
    let cls = CustomBSDatePicker.option.cls;
    let element_arr = $('.' + cls);
    $.each(element_arr, function (ind, val) {
      if($(val).val().length > 0){
        CustomBSDatePicker.initAttributeForModel(model, val);
        let ng_model = $(val).attr('ng-model');
        let last_index = ng_model.lastIndexOf('[');
        let previous_attr = ng_model.substring(0, last_index);
        let str_code = "if("+ng_model+"==''){"+previous_attr+"={}}";
        eval(str_code);
      }
    });
  }
}

// script for Contributor
var username_arr = [];
var email_arr = [];
var filter = {
  filter_username: "",
  filter_email: ''
}
function autocomplete(inp, arr) {
  var currentFocus;

  inp.addEventListener("input", function (e) {
    var form_share_other_user, droplist_show_other_user, i, val = this.value;
    var mode = this.id;
    var flag = false;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    form_share_other_user = document.createElement("DIV");
    form_share_other_user.setAttribute("id", this.id + "autocomplete-list");
    form_share_other_user.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(form_share_other_user);

    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        droplist_show_other_user = document.createElement("DIV");
        /*make the matching letters bold:*/
        droplist_show_other_user.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        droplist_show_other_user.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        droplist_show_other_user.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";

        /*execute a function when someone clicks on the item value (DIV element):*/
        droplist_show_other_user.addEventListener('click', function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          if (mode == 'share_username') {
            filter.filter_username = inp.value;
            // get exact user info contains username and email by username unique
            get_autofill_data(filter.filter_username, "", mode);
          } else {
            if (mode == 'share_email') {
              filter.filter_email = inp.value;
              // get exact user info contains username and email by email
              get_autofill_data('', filter.filter_email, mode);
            }
          }
          closeAllLists();
        });

        form_share_other_user.appendChild(droplist_show_other_user);
        flag = true;
      }
    }
    if (flag == false) {
      if ($(".autocomplete-items div").length == 0) {
        droplist_show_other_user = document.createElement("DIV");
        droplist_show_other_user.innerHTML = "<p>No result found" + "</p>";
        droplist_show_other_user.innerHTML += "<input type='hidden' value='No results found'>";
        form_share_other_user.appendChild(droplist_show_other_user);
      }
    }
  });
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) {
      x = x.getElementsByTagName("div");
    }
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) {
          x[currentFocus].click();
        }
      } else {
        if (currentFocus == -1 && $("#share_username").val() != '') {
          if (x) {
            x[0].click();
          }
        }
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

get_search_data = function (keyword) {
  get_search_data_url = '/api/items/get_search_data/' + keyword;
  if (keyword == 'username') {
    $("#share_username").prop('readonly', true);
    $("#id_spinners_username").css("display", "");
  } else {
    if (keyword == 'email') {
      $("#share_email").prop('readonly', true);
      $("#id_spinners_email").css("display", "");
    }
  }

  $.ajax({
    url: get_search_data_url,
    method: "GET",
    success: function (data, status) {
      if (data.error) {
        //alert("Some errors have occured!\nDetail:" + data.error);
        var modalcontent = "Some errors have occured!\nDetail:" + data.error;
        $("#inputModal").html(modalcontent);
        $("#allModal").modal("show");
        return null;
      } else {
        if (keyword === 'username') {
          $("#id_spinners_username").css("display", "none");
          $("#share_username").prop('readonly', false);
          username_arr = data.results;
          // auto fill for username
          autocomplete(document.getElementById("share_username"), username_arr);

        } else {
          if (keyword === 'email') {
            $("#id_spinners_email").css("display", "none");
            $("#share_email").prop('readonly', false);
            email_arr = data.results;
            // auto fill for email input
            autocomplete(document.getElementById("share_email"), email_arr);
          }
        }
        return data.results;
      }
    },
    error: function (data, status) {
      //alert("Cannot connect to server!");
      var modalcontent = "Cannot connect to server!";
      $("#inputModal").html(modalcontent);
      $("#allModal").modal("show");
    }
  });
}

get_autofill_data = function (keyword, data, mode) {
  // If autofill, "keyword" = email or username, and username, email have to fill to "data"
  // If validate, keyword = username, data = email
  let param = {
    username: "",
    email: ""
  }
  if (keyword == "username") {
    param.username = data;
  } else if (keyword == "email") {
    param.email = data;
  } else {
    param.username = keyword;
    param.email = data;
  }

  //Create request
  $.ajax({
    url: "/api/items/validate_user_info",
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(param),
    dataType: "json",
    success: function (data, status) {
      if (mode == 'share_username') {
        $("#share_email").val(data.results.email);
      } else {
        if (mode == 'share_email') {
          if (data.results.username) {
            $("#share_username").val(data.results.username);
          } else {
            $("#share_username").val("");
          }
        }
      }
    },
    error: function (data, status) {
      //alert("Cannot connect to server!");
      var modalcontent = "Cannot connect to server!";
      $("#inputModal").html(modalcontent);
      $("#allModal").modal("show");
    }
  });
}
$("#share_username").focusout(function () {
  username_arr = [];
  $("#share_email").prop('readonly', true);

})

$("#share_email").focusout(function () {
  email_arr = [];
  $("#share_username").prop('readonly', true);
})

function handleSharePermission(value) {
  if (value == 'this_user') {
    $(".form_share_permission").css('display', 'none');
    $("#share_username").val("");
    $("#share_email").val("");
  } else {
    if (value == 'other_user') {
      $(".form_share_permission").css('display', 'block');
      $("#share_username").val("");
      $("#share_email").val("");
      $("#id_spinners_username").css("display", "none");
      $("#share_username").prop('readonly', true);
      $("#id_spinners_email").css("display", "none");
      $("#share_email").prop('readonly', true);
    }
  }
}

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}

(function (angular) {
  function addAlert(message, class_style) {
    id_alert = "";
    if (typeof class_style === 'undefined') {
      class_style = 'alert-light'
      id_alert = 'alert-style'
    }
    $('#alerts').empty();
    $('#alerts').append(
      '<div class="alert ' + class_style + '" id="' + id_alert + '">' +
      '<button type="button" class="close" data-dismiss="alert">' +
      '&times;</button>' + message + '</div>');
  }

function validateThumbnails(rootScope, scope, itemSizeCheckFlg, files) {
  let result = {
    isValid: true,
    validThumbnails: [],
    errorMessages: []
  },
  inValidThumbnails = [];

  // Check for duplicate files & file type
  if (files && files.length > 0) {
    Array.prototype.forEach.call(files, function (file) {
      if (scope.model.allowedType.indexOf(file.type) >= 0) {
        result.validThumbnails.push(file);
      }
      else {
        inValidThumbnails.push(file.name);
      }
    });
  }

  // Generate error message
  if (inValidThumbnails.length > 0) {
    result.isValid = false;
    result.errorMessages.push($("#invalid_files_type").val() + '<br/>' + inValidThumbnails.join(', '));
  }
  if(rootScope.filesVM){
    thumbnailsVM = rootScope.filesVM.files.filter(file => file.is_thumbnail);

    if (!thumbnailsVM || thumbnailsVM.length == 0){
      return result;
    }

    if (thumbnailsVM.length > 0 && itemSizeCheckFlg) {
      let thumbnailItemKey = scope.searchThumbnailForm && scope.searchThumbnailForm(),
        recordSchema = rootScope.recordsVM.invenioRecordsSchema,
        thumbnailMetaData = recordSchema.properties[thumbnailItemKey],
        thumbnailJson = rootScope.recordsVM.invenioRecordsModel[thumbnailItemKey],
        maxItems = thumbnailMetaData ? thumbnailMetaData.maxItems : 0;

      if (maxItems > 0 && thumbnailsVM.length > maxItems) {
        result.isValid = false;
        result.errorMessages.push(JSON.stringify(thumbnailJson[0]) + ' ' + $("#max_files_thumnbnail_error").val());
      }
    }
  }

  return result;
}
  // Bootstrap it!
  angular.element(document).ready(function () {
    function WekoRecordsCtrl($scope, $rootScope, InvenioRecordsAPI, $filter) {
      $scope.setRecordDataFromApi = function (param) {
        let request = {
          url: '/api/autofill/get_auto_fill_record_data',
          headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          data: JSON.stringify(param),
          dataType: "json"
        };

        InvenioRecordsAPI.request(request).then(
          function success(response) {
            let data = response.data;
            if (data.error) {
              $scope.enableAutofillButton();
              $scope.setAutoFillErrorMessage("An error have occurred!\nDetail: " + data.error);
            } else if (!$.isEmptyObject(data.result)) {
              $scope.clearAllField();
              $scope.setRecordDataCallBack(data);
            } else {
              $scope.enableAutofillButton();
              $scope.setAutoFillErrorMessage($("#autofill_error_doi").val());
            }
          },
          function error(response) {
            $scope.enableAutofillButton();
            $scope.setAutoFillErrorMessage("Cannot connect to server!");
          }
        );
      }
  }
    // Inject depedencies
    WekoRecordsCtrl.$inject = [
      '$scope',
      '$rootScope',
      'InvenioRecordsAPI',
      '$filter'
    ];
    angular.module('wekoRecords.controllers', [])
      .controller('WekoRecordsCtrl', WekoRecordsCtrl);

    var ModalInstanceCtrl = function ($scope, $modalInstance, items) {
      $scope.items = items;
      $scope.selected = {
        item: $scope.items[0]
      };
      $scope.ok = function () {
        $modalInstance.close($scope.selected);
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
      $scope.search = function () {
        $scope.items.push($scope.searchSchemaIdentifierKey);
      }
    };

    angular.module('wekoRecords', [
      'invenioRecords',
      'wekoRecords.controllers',
    ]);

    angular.bootstrap(
      document.getElementById('weko-records'), [
        'wekoRecords', 'invenioRecords', 'mgcrea.ngStrap',
        'mgcrea.ngStrap.modal', 'pascalprecht.translate', 'ui.sortable',
        'ui.select', 'mgcrea.ngStrap.select', 'mgcrea.ngStrap.datepicker',
        'mgcrea.ngStrap.helpers.dateParser', 'mgcrea.ngStrap.tooltip',
        'invenioFiles', 'uploadThumbnail'
      ]
    );
  });
})(angular);
$(function() {
    $("input[type=date]").datetimepicker({
        singleDatePicker: true,
        showdropdowns: true,
        format: 'L'
    }).val();
});
$(document).ready(function() {
    $("table[id^='dTbl']").DataTable(
        {"lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]]
    });
});

$(document).ready(function() {
    // $("table[id^='dTblFill']").DataTable({
    $('#tblFillListYr').DataTable({
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "order" : [[6, "desc"]]
    });
});

$(document).ready(function() {
    // $("table[id^='dTblFill']").DataTable({
    $('#dTblRepairListYr').DataTable({
        "lengthMenu": [[10, 20, 50, -1], [10, 20, 50, "All"]],
        "order" : [[1, "desc"]]
    });
});

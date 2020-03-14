$(document).ready(function(){
    var urlPath=window.location.pathname;
    $("a").each(function(){
        // console.log(urlPath ,'::',$(this).attr("href"));
        if(urlPath == $(this).attr("href")){
            var t=$(this);
            t.parents(".menuItem").find('ul').removeClass("show");
            t.parents(".menuItem").find('a').removeClass("collapsed");
            t.parentsUntil(".menuItem","ul").addClass("show");
            t.parentsUntil(".menuItem","li").addClass("active");
        }
    })
})
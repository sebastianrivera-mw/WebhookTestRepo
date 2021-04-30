// Javascript functions for the Home page

jQuery(document).ready(function() {    

    // Home Page
    jQuery(".home-page .category").click(function() {
        categoryRedirect(jQuery(this));
    });

});

function categoryRedirect(pThis)
{
    let id = pThis.attr('id');
    openCategory(id);
}

function openCategory(pID)
{
    var currentUrl = window.location.href;
    var url = new URL(currentUrl);
    url.searchParams.set("page", pID);
    var newUrl = url.href;
    window.location.href = newUrl;
}

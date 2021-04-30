// Javascript functions for the Sidebar section

jQuery(document).ready(function() {

    // Sidebar
    $('#nav-icon').click(function() {

        // Change icons
        $(this).toggleClass('open');
        $('#search-icon').toggleClass('hidden');

        // Show sidebar
        $('#sidebar').toggleClass('active');
        if ($('#sidebar').hasClass('active'))
        {
            $('#sidebar-content-links').show();
        }
        else
        {
            $('#sidebar-content-links').hide();
            $('#sidebar-content-search').hide();
        }
    });

    $('#search-icon').click(function() {

        // Change icons
        $('#search-icon').toggleClass('hidden');
        $('#nav-icon').toggleClass('open');

        // Show sidebar
        $('#sidebar').toggleClass('active');
        $('#sidebar-content-search').show();
    });
});

function updateResult(pSearchValue)
{
    var searchItemsArrayData = jQuery("#nav-bar-search-items-array").text();
    searchItemsArrayData = JSON.parse(searchItemsArrayData);
    var searchItemNamesArray = searchItemsArrayData.names;
    searchItemsArrayData = searchItemsArrayData.data;

    var html = "";
    if (pSearchValue)
    {
        searchItemNamesArray.map(function(element) {
            pSearchValue.split(" ").map(function (word) {
                if(element.toLowerCase().indexOf(word.toLowerCase()) != -1)
                {
                    html += `
                    <li class="nav-bar-search-results-item">
                        <a href="${searchItemsArrayData[element].pageLink}">${element}</a>
                    </li>`;
                }
            });
        });
    }

    jQuery("#nav-bar-search-results").html(html);
}

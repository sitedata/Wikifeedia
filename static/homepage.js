var category_of_page = 'featured_articles'
if (typeof getUrlVars()['category'] !== 'undefined') {
    category_of_page = getUrlVars()['category']
}

var heroku_url = 'http://wikifeedia.herokuapp.com/index.php?category=' + category_of_page + '&callback=?'
var hex_code = []

function retrive_posts() {

    if ($("#progress").length === 0) {
        $("body").append($("<div><dt/><dd/></div>").attr("id", "progress"));
        $("#progress").width((50 + Math.random() * 30) + "%");
    }

    $.getJSON(urlContent, function(data) {
        next = data.continue.gcmcontinue

        $.each(data.query.pages, function(i, item) {
            content = item.extract
            pageId = item.pageid
            colum = 'post' + pageId
            catId = 'cat' + pageId
            imageHolder = 'image' + pageId

            if ($('#' + colum).length == 0) {
                $('#feed').append('<div id = ' + colum + '>')

                if ($('#' + colum + ' h2').length == 0) {
                    if(item.title.indexOf("Category:") != -1) {
                    	item.title = item.title.replace("Category:", "<span>Category:")
                    	item.title = item.title+"</span>"
                    }

                    else {
                    	temp_url = "https://en.wikipedia.org/wiki/" + item.title;
                    	item.title =  "<a href="+temp_url + " target='_blank' >"+item.title +"</a>";
                    }


                    $('#' + colum).append('<h2>' + item.title + '</h2>')
                }

                if ($('#' + catId).length == 0) {
                    $('#' + colum).append('<div id = ' + catId + '> </div><br>')
                }

                if ($('#' + imageHolder).length == 0) {
                    $('#' + colum).append('<div id = ' + imageHolder + '> </div><br>')
                    fetchImage(pageId)

                }

                if ($('#' + colum + ' p').length == 0) {
                    $('#' + colum).append('<p>' + content + '</p>')
                    $('#feed').append('</div><hr><br>')
                    fetchCat(pageId)
                }

            }

        })

        $('div#loadmoreajaxloader').hide()
        $("#progress").width("101%").delay(200).fadeOut(400, function() {
            $(this).remove();
        });


    })
}

function loadStartIndex() {
    $.getJSON(heroku_url, function(data) {
        start_page = data.category
        start_page_cleaned = start_page.replace('_', ' ')
        start_page_cleaned = start_page.toUpperCase()


        for (var i = 0; i < start_page_cleaned.length; i++) {
            hex_code = hex_code + start_page_cleaned.charCodeAt(i).toString(16)
        }

        start_url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=categories&titles=' + start_page + '&callback=?'

        $.getJSON(start_url, function(data) {
            $.each(data.query.pages, function(i, item) {
                start_id = item.pageid
                next = 'page|' + hex_code + '|' + start_id
                fetchInitialPost()

            })

            console.log(next)

        })

    })

}

function fetchInitialPost() {
    urlContent = 'http://en.wikipedia.org/w/api.php?format=json&action=query&list=random&generator=categorymembers&gcmtitle=Category:' + category_of_page + '&prop=info&prop=extracts&exintro=&explaintext&exlimit=max&continue=gcmcontinue||random&rnlimit=10&rnnamespace=0&gcmcontinue=' + next + '&continue=&callback=?'
    retrive_posts();


    return 1
}

function fetchImage(pageId) {
    urlImage = 'http://en.wikipedia.org/w/api.php?action=query&pageids=' + pageId + '&prop=pageimages&format=json&pithumbsize=500&continue=&callback=?'

    $.getJSON(urlImage, function(data) {
        $.each(data.query.pages, function(i, item) {
            content = item.thumbnail.source
            colum = 'image' + pageId
            $('#' + colum).append("<img id='maxwidth' src = " + content + '> </img>')

        })
    })

}




$(document).ready(function() {
    //  
    loadStartIndex()
    $('#search_input').keyup(function() {
        var search_input = $(this).val()
        console.log(search_input)
        category_of_page = search_input

        $('#feed').html('')
        $('#feed').append('Showing results for <b>' + category_of_page + ' </b><span id="message">Chronologically</span><hr>')
        $('div#loadmoreajaxloader').show()
        urlContent = 'http://en.wikipedia.org/w/api.php?format=json&action=query&list=random&generator=categorymembers&gcmtitle=Category:' + category_of_page + '&prop=info&prop=extracts&exintro=&explaintext&exlimit=max&continue=gcmcontinue||random&rnlimit=10&rnnamespace=0&continue=&callback=?'
        retrive_posts();
        //loadStartIndex()
    })

    $('#feed').on('click', 'span', function() {


        if ($(this).text() == "Chronologically") {
            $('#feed').html('')
            $('#feed').append('Showing results for <b>' + category_of_page + ' </b><span id="message">Randomly</span><hr>')
            $('div#loadmoreajaxloader').show()
            loadStartIndex();

        } else {


            if ($(this).text() != "Randomly") {
                category_of_page = $(this).text()
            }

            $('#feed').html('')
            $('#feed').append('Showing results for <b>' + category_of_page + '</b><span id="message">Chronologically</span><hr>')

            $('div#loadmoreajaxloader').show()
            urlContent = 'http://en.wikipedia.org/w/api.php?format=json&action=query&list=random&generator=categorymembers&gcmtitle=Category:' + category_of_page + '&prop=info&prop=extracts&exintro=&explaintext&exlimit=max&continue=gcmcontinue||random&rnlimit=10&rnnamespace=0&continue=&callback=?'
            retrive_posts();
        }
        //loadStartIndex()
    })

})

$(window).scroll(function() {
    if ($(window).scrollTop() == $(document).height() - $(window).height()) {
        data = 0
        urlContent = 'http://en.wikipedia.org/w/api.php?format=json&action=query&list=random&generator=categorymembers&gcmtitle=Category:' + category_of_page + '&prop=info&prop=extracts&exintro=&explaintext&exlimit=max&continue=gcmcontinue||random&rnlimit=10&rnnamespace=0&gcmcontinue=' + next + '&continue=&callback=?'

        $('div#loadmoreajaxloader').show()
        retrive_posts();
    }
})

function getUrlVars() {
    var vars = {}
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value
    })
    return vars
}

function fetchCat(pageId) {
    ul = 'https://en.wikipedia.org/w/api.php?action=query&format=json&grnlimit=max&exlimit=max&prop=categories&pageids=' + pageId + '&continue=&callback=?'

    $.getJSON(ul, function(data) {
        $.each(data.query.pages, function(i, item) {
            k = 0
            $.each(item.categories, function(j, cat) {
                catId = 'cat' + pageId
                catile = cat.title
                catile = catile.replace('Category:', '')
                if ((catile.match(/articles/g) || []).length == 0 && (catile.match(/Articles/g) || []).length == 0 && (catile.match(/Pages/g) || []).length == 0 && (catile.match(/Article/g) || []).length == 0 && (catile.match(/category/g) || []).length == 0 && (catile.match(/pages/g) || []).length == 0 && k < 5) {
                    k++
                    $('#' + catId).append("<span id = 'category'>" + catile + ' </span>')

                }

            })

        })
    })

}
//Template for book structure
function bookTemplate(na, i, aut, pub, pr, gid){
   this.bookname = na;
   this.bookid = i;
   this.author = aut;
   this.publisher = pub;
   this.price = pr;
   this.guid = gid;

   return this;
};

function initialize(na, i, aut, pub, pr, gid){
 var u = new bookTemplate(na, i, aut, pub, pr, gid);
 return u;
};

exports.initialize = initialize;

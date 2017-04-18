/*****************************************************************
File: index.js
Author: Jake Oh
Description:
Here is the sequence of logic for the app
- Once Device ready, will read localStorage
Version: 0.0.1
Updated: Apr 3, 2017
- 
*****************************************************************/
const MYKEY = "reviewr-oh000024";

let greviews = [];

var grating = 1;
var stars = null;

let regNumber = /^[0-5]$/;
let greviewId = 0;
let imagepath = "";

let BASE64="data:image/png;base64,";

var REVIEW = {
	id: '',
	name: '',
	rating: 0,
	img: ''
};


function addListeners(){
  [].forEach.call(stars, function(star, index){
    star.addEventListener('click', (function(idx){
      console.log('adding listener', index);
      return function(){
        grating = idx + 1;  
        setRating();
      }
    })(index));
  });
}

function setRating(){
  [].forEach.call(stars, function(star, index){
    if(grating > index){
      star.classList.add('rated');
    }else{
      star.classList.remove('rated');
    }
  });
}
var app = {
	localNote: null,
	init: function () {
		try {
			console.logO("Start app's initialization")
			document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		} catch (e) {
			document.addEventListener('DOMContentLoaded', this.onDeviceReady.bind(this), false);
			console.log('failed to find deviceready');
		}
	},
	onDeviceReady: function () {
		console.log("called onDeviceReady");
		console.log(navigator.camera);
		//MODALHANDLER.init();
		GSTORAGE.init();

		let camBtn = window.document.querySelector('.btn.btn-primary.btn-block');
		camBtn.addEventListener('touchstart', this.onCamera);

		let CanBtn = window.document.querySelector('#cancel.btn.btn-block');
		CanBtn.addEventListener('touchstart',(function(mname){return function(){app.onCancel(mname);}})("ReviewModal"));
//		CanBtn.addEventListener('touchstart', this.onCancel);

		let saveBtn = window.document.querySelector('#save.btn.btn-positive');
		saveBtn.addEventListener('touchstart', this.onSave);
				
		window.document.querySelector("a.icon.icon-left-nav.pull-left").addEventListener('touchstart',(function(mname){return function(){app.onCancel(mname);}})("DeleteReviewModal"));
		
		window.document.querySelector(".btn.btn-link.btn-nav.pull-right").addEventListener("touchstart",function(){
			HTMLHANDLER.clearModal();
		});
		
		window.document.querySelector("#ReviewModal a.icon.icon-close.pull-right").addEventListener("touchstart",function(){
			app.onCancel("");
		});
			
		//window.addEventListener('push', app.pageChanged);
	   stars = document.querySelectorAll('.star');
	   addListeners();
  		  //setRating(); //based on global rating variable value

		HTMLHANDLER.createReviewsList();
	},
	onDelete: function (par, target) {
	
		let _pro = new Promise(
			function(resolve,reject){
				
				console.log("Before count: " + GSTORAGE.gdata.length);

				//app.generateMessage("#delreview","info","Review Deleted");
				GSTORAGE.gdata = GSTORAGE.gdata.filter(function (p) {
					return p.id != greviewId;
				});
				localStorage.setItem(MYKEY, JSON.stringify(GSTORAGE.gdata));

				let review = document.querySelector("#DeleteReviewModal div.content-padded");
				review.firstElementChild.classList.add("fadeout");

				greviewId = 0;
				par.removeChild(par.childNodes[0]);

				console.log("After count: " + GSTORAGE.gdata.length);	
				setTimeout(function(){
					resolve();
				},500);
			});
		
		_pro.then(function(){
			app.onCancel("DeleteReviewModal");
			HTMLHANDLER.createReviewsList();
		})
		.catch(function(mesage){
			   alert(message);
			   })
		
	},
	onCancel: function (m) {
		
		try{
		console.log("called onCancel");
		
		if("DeleteReviewModal" === m){
			let p = document.querySelector("#DeleteReviewModal p.content-padded");
			for(let i=0,j=p.childElementCount;i<j;i++){
				p.removeChild(p.firstElementChild);
			}
		}
			//else{
//			navigator.camera.cleanup(function(){}, app.onError);
//		}

		let modal = document.getElementById(m);
		modal.classList.remove('active');
		} catch(e){
			app.generateMessage(e.message);
		}finally{
			greviewId=0;
			grating=1;
			
			HTMLHANDLER.clearModal();
		}

	},
	onSave: function () {
		
		try{
			console.log("called onSave");
			let name = document.getElementById("name").value;
			let rating = grating;//document.getElementById("rate").value;

			if (!(name && 0xff)) {
				app.generateMessage("#ReviewModal form.input-group","bad","Please enter a name of Item");
				return;
			}
			
			if(!(imagepath && 0xff)){
			   	app.generateMessage("#ReviewModal form.input-group","bad","Please take a picture for Item")
			   	return;
			   }
		
			//console.log(newPath);	
			let review = Object.create(REVIEW);
			review.name = name;
			review.rating = rating;
			review.id = Date.now();
			review.img = imagepath;//newPath;

			GSTORAGE.saveReview(review);
		
			let modalpad = document.querySelector("#ReviewModal p.content-padded");
			modalpad.removeChild(modalpad.firstElementChild);
			
			HTMLHANDLER.createReviewsList();
			grating = 1;
			imagepath="";			
			let modal = document.getElementById('ReviewModal');
			
			modal.classList.remove('active');
//			navigator.camera.cleanup(function(){}, app.onError);

		}catch(e){
			app.generateMessage("Create Object Error.Try it again");
		}
	},

	onCamera: function () {
		console.log("Operating a camera");

		var options = {
			quality: 80,
			destinationType: Camera.DestinationType.FILE_URI,
			encodingType: Camera.EncodingType.PNG,
			mediaType: Camera.MediaType.PICTURE,
			pictureSourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			targetWidth: 300,
			targetHeight: 300
		}
		navigator.camera.getPicture(app.onSuccess, app.onError, options);
	},
	onSuccess: function (imageData) {
		console.log("successfull." +imageData);
		
		imagepath = imageData; //"data:image/jpeg;base64,"
			
		let img = document.createElement("img");
		img.classList.add("mid-thumb");
		
		let modalpad= document.querySelector("#ReviewModal p.content-padded");
			
		img.src = imageData;
		img.style.width ="100%";
		img.style.height="100%";

		//thumb.style.display="block";
		
		HTMLHANDLER.replaceBut(img);

	},
	onError: function (obj,type="bad",message) {
//		console.log(message);
		app.generateMessage(obj,type="bad",message);
	},
	generateMessage: function (obj,type="bad",message) {
		let mcontent = window.document.querySelector(obj);
		//let mcontentpad = window.document.querySelector('#ReviewModal div.content-padded');
		let div = document.createElement('div');

		div.classList.add('msg');
		setTimeout(function () {
			div.classList.add(type);
		}, 20); //delay before adding the class to trigger transition

		div.textContent = message===null?"Unknown Error":message;

		mcontent.insertBefore(div, mcontent.firstElementChild[0]);
		setTimeout((function (m, d) {
			return function () {
				m.removeChild(d);
			}
		})(mcontent, div), 3210);
	}
};
const GSTORAGE = {
	storage: "",
	gdata: null,
	init: function () {
		try {
			console.log("Start GSTROGAGE Initialization");
			this.gdata = [];
			this.storage = localStorage.getItem(MYKEY);

			if (this.storage === null) {
				console.log("LocalStorage is Empty");
				//this.gdata=greviews;
				//localStorage.setItem(MYKEY,JSON.stringify(this.gdata));
			} else {
				this.gdata = JSON.parse(this.storage);
				console.log("FIRST DATA: " + this.gdata);

				//this.sortData(this.gdata);
				console.log("LATER DATA: " + this.gdata);
			}
			console.log("Finish GSTROGAGE Initialization");
		} catch (e) {
			console.log(e.message);
		}
	},
	saveReview: function (review) {
		try {
			console.log("Save Picture");
			this.gdata.push(review);
			localStorage.setItem(MYKEY, JSON.stringify(this.gdata));
			console.log("Successfully Update : " + review.name + "," + review.rating);
			//			}
		} catch (e) {
			console.log(e);
			app.generateMessage(e.message);
		}
	},

	// When Gifts was updated..
	deleteReview: function (id) {
		try {
			for (let i = 0, j = this.gdata.length; i < j; i++) {
				if (id == this.gdata[i].id) {
					console.log("BEFORE: " + this.gdata[i].ideas);
					this.gdata[i].ideas = this.gdata[i].ideas.filter(function (p) {
						return p.idea != idea;
					});
					localStorage.setItem(MYKEY, JSON.stringify(this.gdata));
					console.log("AFTER: " + this.gdata[i].ideas);
					break;
				}
				console.log("Contine");
			}
		} catch (e) {
			console.log(e.message);
		}
	}

}
const HTMLHANDLER = {
	createReviewsList: function () {
		try {
			let ul = document.querySelector(".table-view");
			ul.innerHTML = "";
			for (let item of GSTORAGE.gdata) {

				//console.log("review: " + item.img);

				let li = document.createElement("li");
				let aNav = document.createElement("a");
				let aImg = document.createElement("img");
				let aDiv = document.createElement("div");
				let aP = document.createElement("p");

				li.classList.add("table-view-cell", "media");

				aNav.classList.add("navigate-right");
				aNav.href = "#DeleteReviewModal";

				// To set up Uniq ID
				let att = document.createAttribute("data-id");
				att.value = item.id;
				aNav.setAttributeNode(att);

				aNav.addEventListener("touchstart", (function (u, l) {

					return function () {
						//var a = ev.currentTarget;
						greviewId = aNav.getAttribute("data-id");
						console.log("Clicked ID is " + greviewId);
						let pa = u;
						let tar = l;
						for (let i = 0, j = GSTORAGE.gdata.length; i < j; i++) {

							if (greviewId == GSTORAGE.gdata[i].id) {
								let review = GSTORAGE.gdata[i];
								let pad = document.querySelector("#DeleteReviewModal p.content-padded");
								let div = document.querySelector("#delreview");

								let pName = document.createElement("p");
								let aName = document.createElement("a");
								let aP = document.createElement("p");

								let img = document.createElement("img");
								img.src = review.img;
								img.style.width="100%";
								img.style.width="100%";

								pad.classList.remove("fadeout");
								pName.textContent = review.name;
								pName.style.fontSize="2.0rem";
								pName.style.marginTop="1rem";
//								pName.style.marginBottom="1em";
								
								HTMLHANDLER.addStar(aP,review.rating);
								
								//pad.appendChild(aP);
								aName.appendChild(img);
							
								pad.appendChild(aName);
								pad.appendChild(pName);
								pad.appendChild(aP);

								let delBtn = document.querySelector('#delete.btn');

								delBtn.addEventListener('touchstart', (function (ul, li) {
									
									return function(){app.onDelete(ul,li)};
								})(pa, tar));

								break;
							}
						}
					}
				})(ul, li));

				aImg.classList.add("media-object", "pull-left");
				aImg.src = item.img;
				aImg.style.width="80px";
				aImg.style.height="80px";
				aDiv.classList.add("media-body");
				aDiv.textContent = item.name;
				//aP.textContent = item.rating;
				
				HTMLHANDLER.addStar(aP,item.rating);
				
				aDiv.appendChild(aP);
				aNav.appendChild(aImg);
				aNav.appendChild(aDiv);
				li.appendChild(aNav);
				ul.appendChild(li);
			}

		} catch (e) {
			HTMLHANDLER.generateMessage(e.message);
		}

	},
	addStar:function(par,count){
		for(let i =0,j=count;i<j;i++){
		let span = document.createElement("span");
			//span.textContent = "&nbsp;";
		span.classList.add('star');
		span.classList.add('rated');
		span.classList.add('reviewp');
			//span.textContent='&#9733';
		span.style.fontSize="1.6rem";
		par.appendChild(span);
		}
	},
	replaceBut:function(img){
		
		let but = document.querySelector("#ReviewModal button.btn.btn-primary.btn-block");
		but.style.display = "none";
		
		let modalpad = document.querySelector("#ReviewModal p.content-padded");
		modalpad.insertBefore(img,modalpad.firstElementChild);
		
	},
	clearModal:function(){
		document.getElementById("name").value="";
		grating	= 1;
		setRating();
		imagepath="";
//		navigator.camera.cleanup(function(){}, app.onError);
		
		let img = document.querySelector(".mid-thumb");
		if(img&&0xff){	
			let modalpad = document.querySelector("#ReviewModal p.content-padded");
			modalpad.removeChild(modalpad.firstElementChild);				
		}

		let but = document.querySelector("#ReviewModal button.btn.btn-primary.btn-block");
		but.style.display = "block";
	}
}

app.init();

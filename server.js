var http = require("http");
var MongoPortable = require("mongo-portable").MongoPortable;
var store = require("file-system-store").FileSystemStore;
var moment = require("moment");

const PORT = process.env.PORT || 3001;
const ddbb_name = "pi_feeder";
const coll_name = "jobs";

function handleError(error) {
	if (error) throw error;
}

var db = new MongoPortable(ddbb_name);
db.addStore(new store({
	ddbb_path: "ddbb"
}));

http
	.createServer(function(req, res) {
		if (req.method === "GET") {
			if (req.url === "/feeder/api/open") {
				db.collection(coll_name, function(coll) {
					coll.insert({ feed: true, feed_date: moment("18000101").format("DD/MM/YYYY") }, function(doc) {
						res.end("job created");
					});
				});
			}
			
			if (req.url === "/feeder/job") {
				db.collection(coll_name, function(coll) {
					coll.update({
						feed_date: moment("18000101").format("DD/MM/YYYY")
					}, {
						feed_date: moment().format("DD/MM/YYYY")
					}, {
						multi: true
					}, 	function(error, result) {
						handleError(error);
						
						if (result && result.updated.count > 0) {
							res.end("1");
						} else {
							res.end("0");
						}
					});
				});
			}
			
			// Otherwise
			res.end("Unauthorized");
		}
	})
	.listen(PORT, function() {
		console.log("Server listening");
	});
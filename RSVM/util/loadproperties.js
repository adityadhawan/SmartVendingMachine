var nconf = require('nconf')
var fs = require('fs');
/*var myOptions = {
  name: 'Avian',
  dessert: 'cake',
  flavor: 'chocolate',
  beverage: 'coffee'
};

var data = JSON.stringify(myOptions);

fs.writeFile('./config.json', data, function (err) {
  if (err) {
    console.log('There has been an error saving your configuration data.');
    console.log(err.message);
    return;
  }
  console.log('Configuration saved successfully.')
});*/

module.exports.loadProperties = function(){
	
nconf.use('file', { file: './resource/properties.json' });
//nconf.use('file', { file: './resource/config.js' });
nconf.load();
/*nconf.set('name', 'Avian');
nconf.set('dessert:name', 'Ice Cubeeee');
nconf.set('dessert:flavor', 'chocolate');*/

console.log("=========&&&&&&&&&&&&&&========  "+JSON.stringify(nconf.get(config.sitename)));

nconf.save(function (err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Configuration saved successfully.');
});
}


module.exports.getProperties = function(name)
{
	var x = name
	console.log('========='+name);
	console.log("=========222========  "+nconf.get(name));
	
	var value = nconf.get(name);
	
	return value;
};




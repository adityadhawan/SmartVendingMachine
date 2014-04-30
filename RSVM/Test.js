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

var fun = function()
{
	console.log("999999999999");
	
	if(1==1)
		{
		console.log("1111");
		}else if(2==2)
			{
			console.log("222");
			
			}
		else if(3==3)
			{
			console.log("333");
			}
	if(3>2)
		{
		console.log("55555555555555");
		console.log("=================  "+nconf.get('beverage'));
		var x = getData('beverage');
		console.log("------  "+x);
		}
	
	}
nconf.use('file', { file: './config.json' });
nconf.load();
nconf.set('name', 'Avian');
nconf.set('dessert:name', 'Ice Cream');
nconf.set('dessert:flavor', 'chocolate');

console.log("=================  "+nconf.get('beverage'));

nconf.save(function (err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Configuration saved successfully.');
  fun()
});

function getData(name)
{
	console.log("inside getdata  "+nconf.get(name));
	return nconf.get(name);
	
	};
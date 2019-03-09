import requests
import tweepy

def get_events(address, nblocks = 100):
	#nblocks = How many blocks of history to take
	
	#Private api key which can be obtained at https://etherscan.io for free
	apikey = 'insert api key her'

	#Get the id of latest block
	urllatest = 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey='+apikey
	response = requests.get(urllatest)
	address_content = response.json()
	latestblock = int(address_content.get("result"),16)

	#Generate url for request
	url = "https://api.etherscan.io/api?module=logs&action=getLogs&apikey="+apikey+"&address="+address+"&fromBlock="+str(latestblock-nblocks)+"&toBlock=latest"

	response = requests.get(url)
	address_content = response.json()
	result = address_content.get("result")
	#return result of request
	return result



def get_api(cfg):
  auth = tweepy.OAuthHandler(cfg['consumer_key'], cfg['consumer_secret'])
  auth.set_access_token(cfg['access_token'], cfg['access_token_secret'])
  return tweepy.API(auth)

def tweet(msg):
	cfg = { 
		"consumer_key"        : "",
		"consumer_secret"     : "",
		"access_token"        : "",
		"access_token_secret" : "" 
		}

	api = get_api(cfg)
	status = api.update_status(status=msg) 

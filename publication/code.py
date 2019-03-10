"""

Small script to ask all the events of a contract and post them on twitter
to run this at home you need requests, tweepy, web3 as well as a developer 
twitter account and a etherscan api key

"""


import time
import requests
import tweepy
from web3 import Web3


#Address of the contract
address = '0x4ae1e5b4FB7Ee9AcFE12dF24b966607c96104624'


#Etherscan api key
apikey = ##############


#Twitter account tokens and keys
cfg = { 
        "consumer_key"        : ###############,
        "consumer_secret"     : ###############,
        "access_token"        : ###############,
        "access_token_secret" : ############### 
        }


#Contract events binary values (can most likely be improved by using web3)
VOTE = '0x2d001ba489b53f78f9a965d14bebd1e1629df65697050744dae7675b69db34ec'
NEW_ELECTION = '0xbccc53fb30affae804700858a14d3c076217dc692f8b78af36d53a6d3c70486e'
END_ELECTION = '0x27f6944da2fde797e7ab0a7bb6c15a9c19c9dcc7b934afb4df380cf6e570537b'
FOR = '0x4da251966e012d38259b59ac1f4672513d4757e018112d6d1438587a0455b8d0'


#Gets all he events at certain address since the number of the last block in the nblock.txt file
def get_events(address):    
    with open('nblock.txt','r') as file:
        lastblock = int(file.read()) 

    url = "https://api-rinkeby.etherscan.io/api?module=logs&action=getLogs&apikey="+apikey+"&address="+address+"&fromBlock="+str(lastblock)+"&toBlock=latest"

    response = requests.get(url)
    address_content = response.json()
    result = address_content.get("result")
    
    urllatest = 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey='+apikey
    response = requests.get(urllatest)
    address_content = response.json()
    latestblock = int(address_content.get("result"),16)

    with open('nblock.txt','w') as file:
        file.write(str(latestblock))

    return result


#Functions to tweet automaticaly
def get_api(cfg):
    auth = tweepy.OAuthHandler(cfg['consumer_key'], cfg['consumer_secret'])
    auth.set_access_token(cfg['access_token'], cfg['access_token_secret'])
    return tweepy.API(auth)

def tweet(msg):
    api = get_api(cfg)
    status = api.update_status(status=msg) 


#Just utf 8 encoding to be able to print emojies
def emo(em):
    return em.decode('utf-8')


#Get the eth value from wei with at most 5 digits after comma and never return 0 (min is 0.0...01)
def to_eth(wei):
    x = 4
    return max(round(Web3.fromWei(wei,'ether'),x),10**-x)


#Modify the address to human readable
def badd(address):
    return address[:8]+'...'



#Creates all the texts for the different tweets
def new_election(address):
    add = badd(address)
    text =  emo(b'\xF0\x9F\x93\xA2')+' New election ! Is {} the address of a frequent contributor to open source projects ? Vote and bet at   https://siggg.github.io/culottes/?candidate={}'.format(add,address)
    return text

def lost(address):
    add = badd(address)
    text = emo(b'\xF0\x9F\x98\x90')+' Election closed. {} has NOT been recognized as a frequent contributor to open source projects ! More details at  https://siggg.github.io/culottes/?candidate={}'.format(add,address)
    return text

def win(address):
    add = badd(address)
    text = emo(b'\xF0\x9F\x98\x83')+' Election closed. Congratulation! {} has been recognized as a frequent contributor to open source projects ! More details at  https://siggg.github.io/culottes/?candidate={}'.format(add,address)
    return text

def vote(address,ammount,direction):
    add = badd(address)
    txt = emo(b'\xF0\x9F\x91\x8D') if direction == 'FOR' else em(b'\xF0\x9F\x91\x8E')
    text = txt+' New vote registered: {} ETH were placed {} {}. Is it the adress of a frequent contributor to open source projects? More details at   https://siggg.github.io/culottes/?candidate={}'.format(to_eth(ammount),direction,add,address)
    return text



#Englobing function wich combines it all
def update_culottes():
    events = get_events(address)

    for event in events:
        topics = event['topics']
        
        topics[2] = '0x' + topics[2][26:]

        if topics[0] == VOTE:
            direction = 'FOR' if topics[1] == FOR else 'AGAINST' 
            text = vote(topics[2],int(topics[3],16),direction)
            
        elif topics[0] == NEW_ELECTION:
            text = new_election(topics[2])
            
        elif topics[0] == END_ELECTION:
            accepted = True
            if accepted:
                text = win(topics[2]) 
            else:
                text = lost(topics[2])
        
        text += str(time.time()) 
        tweet(text)



#Loop to keep everyone update (other ideas crontab)
while True:
    update_culottes()
    time.sleep(5)

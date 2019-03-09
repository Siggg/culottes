from update import tweet, get_events

#address of the contract
address = "0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef"

events = get_events(address)

print(events)

tweet('hello culottes!')


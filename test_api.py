import requests

url = "http://127.0.0.1:5000/api/personalize"

tests = [
    {
        "role": "runner",
        "location": "Bengaluru"
    },
    {
        "role": "farmer",
        "location": "Davangere"
    },
    {
        "role": "commuter",
        "location": "Bengaluru"
    },
    {
        "role": "traveller",
        "location": "Bengaluru",
        "destination": "Goa, Goa"
    }
]

for test in tests:

    print("\n" + "=" * 50)
    print("TEST:", test)
    print("=" * 50)

    response = requests.post(url, json=test)

    print("STATUS:", response.status_code)
    print("RESPONSE:")
    print(response.json())
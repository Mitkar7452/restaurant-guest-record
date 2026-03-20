#!/usr/bin/env python3
"""
Backend Test Suite for Restaurant Guest Management API
Tests all the API endpoints as specified in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://quick-guest-log.preview.emergentagent.com"
API_BASE_URL = f"{BASE_URL}/api"

def test_root_endpoint():
    """Test GET /api/ - Root endpoint"""
    print("🔄 Testing root endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            if "message" in data and "Restaurant Guest Management API" in data["message"]:
                print("✅ Root endpoint working correctly")
                return True
            else:
                print("❌ Root endpoint response format incorrect")
                return False
        else:
            print(f"❌ Root endpoint failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint request failed: {e}")
        return False

def test_get_settings_initial():
    """Test GET /api/settings - Get initial WhatsApp settings"""
    print("\n🔄 Testing get settings (initial)...")
    try:
        response = requests.get(f"{API_BASE_URL}/settings")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            if "whatsapp_target" in data:
                print("✅ Settings endpoint working correctly")
                return True, data
            else:
                print("❌ Settings response missing whatsapp_target field")
                return False, None
        else:
            print(f"❌ Settings endpoint failed with status {response.status_code}")
            return False, None
    except requests.exceptions.RequestException as e:
        print(f"❌ Settings request failed: {e}")
        return False, None

def test_update_settings():
    """Test PUT /api/settings - Update WhatsApp settings"""
    print("\n🔄 Testing update settings...")
    test_whatsapp_number = "919876543210"
    payload = {"whatsapp_target": test_whatsapp_number}
    
    try:
        response = requests.put(
            f"{API_BASE_URL}/settings",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            if data.get("whatsapp_target") == test_whatsapp_number and data.get("success"):
                print("✅ Settings update working correctly")
                return True
            else:
                print("❌ Settings update response incorrect")
                return False
        else:
            print(f"❌ Settings update failed with status {response.status_code}")
            print(f"Response text: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Settings update request failed: {e}")
        return False

def test_get_settings_after_update():
    """Test GET /api/settings - Verify settings were saved"""
    print("\n🔄 Testing get settings (after update)...")
    expected_number = "919876543210"
    
    try:
        response = requests.get(f"{API_BASE_URL}/settings")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            if data.get("whatsapp_target") == expected_number:
                print("✅ Settings persistence working correctly")
                return True
            else:
                print(f"❌ Settings not persisted correctly. Expected: {expected_number}, Got: {data.get('whatsapp_target')}")
                return False
        else:
            print(f"❌ Settings verification failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Settings verification request failed: {e}")
        return False

def test_create_walk_in_guest():
    """Test POST /api/guests - Create walk-in guest entry"""
    print("\n🔄 Testing create walk-in guest...")
    
    guest_data = {
        "name": "John Doe",
        "phone": "+919876543210",
        "pax": 4,
        "check_in_time": "14:30",
        "place": "Sol Cafe",
        "guest_type": "Walk-in Guest",
        "room_number": None
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/guests",
            json=guest_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify all required fields are present
            required_fields = ["id", "name", "phone", "pax", "check_in_time", "place", "guest_type", "created_at"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print("✅ Walk-in guest creation working correctly")
                return True, data
            else:
                print(f"❌ Missing fields in response: {missing_fields}")
                return False, None
        else:
            print(f"❌ Walk-in guest creation failed with status {response.status_code}")
            print(f"Response text: {response.text}")
            return False, None
    except requests.exceptions.RequestException as e:
        print(f"❌ Walk-in guest creation request failed: {e}")
        return False, None

def test_create_room_guest():
    """Test POST /api/guests - Create room guest entry"""
    print("\n🔄 Testing create room guest...")
    
    guest_data = {
        "name": "Jane Smith",
        "phone": "+919876543211",
        "pax": 2,
        "check_in_time": "15:00",
        "place": "Poolside",
        "guest_type": "Room Guest",
        "room_number": "101"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/guests",
            json=guest_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify all required fields are present including room_number
            required_fields = ["id", "name", "phone", "pax", "check_in_time", "place", "guest_type", "room_number", "created_at"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields and data.get("room_number") == "101":
                print("✅ Room guest creation working correctly")
                return True, data
            else:
                print(f"❌ Missing fields in response: {missing_fields}")
                return False, None
        else:
            print(f"❌ Room guest creation failed with status {response.status_code}")
            print(f"Response text: {response.text}")
            return False, None
    except requests.exceptions.RequestException as e:
        print(f"❌ Room guest creation request failed: {e}")
        return False, None

def test_get_all_guests():
    """Test GET /api/guests - Get all guest entries"""
    print("\n🔄 Testing get all guests...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/guests")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of guests returned: {len(data)}")
            
            if isinstance(data, list):
                if len(data) >= 2:  # Should have at least the 2 guests we created
                    print("Guest entries found:")
                    for i, guest in enumerate(data):
                        print(f"  Guest {i+1}: {guest.get('name')} - {guest.get('guest_type')} - Created: {guest.get('created_at')}")
                    
                    # Check if sorted by created_at (newest first)
                    if len(data) >= 2:
                        first_guest_time = datetime.fromisoformat(data[0]["created_at"].replace('Z', '+00:00'))
                        second_guest_time = datetime.fromisoformat(data[1]["created_at"].replace('Z', '+00:00'))
                        
                        if first_guest_time >= second_guest_time:
                            print("✅ Guest retrieval working correctly (sorted by newest first)")
                            return True
                        else:
                            print("❌ Guests not sorted correctly by created_at")
                            return False
                    else:
                        print("✅ Guest retrieval working correctly")
                        return True
                else:
                    print("❌ Expected at least 2 guests but got fewer")
                    return False
            else:
                print("❌ Response is not a list")
                return False
        else:
            print(f"❌ Get guests failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get guests request failed: {e}")
        return False
    except ValueError as e:
        print(f"❌ Error parsing datetime: {e}")
        return False

def run_all_tests():
    """Run all the backend API tests"""
    print("🚀 Starting Restaurant Guest Management API Tests")
    print(f"Base URL: {API_BASE_URL}")
    print("=" * 60)
    
    test_results = {}
    
    # Test 1: Root endpoint
    test_results['root_endpoint'] = test_root_endpoint()
    
    # Test 2: Get initial settings
    initial_settings_result, initial_data = test_get_settings_initial()
    test_results['get_settings_initial'] = initial_settings_result
    
    # Test 3: Update settings
    test_results['update_settings'] = test_update_settings()
    
    # Test 4: Verify settings were saved
    test_results['get_settings_after_update'] = test_get_settings_after_update()
    
    # Test 5: Create walk-in guest
    create_walk_in_result, walk_in_data = test_create_walk_in_guest()
    test_results['create_walk_in_guest'] = create_walk_in_result
    
    # Test 6: Create room guest
    create_room_result, room_data = test_create_room_guest()
    test_results['create_room_guest'] = create_room_result
    
    # Test 7: Get all guests
    test_results['get_all_guests'] = test_get_all_guests()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Restaurant Guest Management API is working correctly.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
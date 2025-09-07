/**
 * Simple API test script
 * Run this after starting the server to test basic functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123'
};

const testBlog = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content. It should be at least 50 characters long to pass validation.',
  tags: ['test', 'api'],
  status: 'published'
};

let authToken = '';

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: Register User
    console.log('\n2. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      authToken = registerResponse.data.token;
      console.log('✅ User Registration:', registerResponse.data.message);
      console.log('   Token received:', authToken ? 'Yes' : 'No');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  User already exists, trying login...');
        
        // Test 3: Login User
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        authToken = loginResponse.data.token;
        console.log('✅ User Login:', loginResponse.data.message);
      } else {
        throw error;
      }
    }

    // Test 4: Get Current User
    console.log('\n3. Testing Get Current User...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get Current User:', meResponse.data.user.name);

    // Test 5: Create Blog
    console.log('\n4. Testing Create Blog...');
    const createBlogResponse = await axios.post(`${BASE_URL}/blogs`, testBlog, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const blogId = createBlogResponse.data.data._id;
    console.log('✅ Create Blog:', createBlogResponse.data.message);
    console.log('   Blog ID:', blogId);

    // Test 6: Get All Blogs
    console.log('\n5. Testing Get All Blogs...');
    const getBlogsResponse = await axios.get(`${BASE_URL}/blogs`);
    console.log('✅ Get All Blogs:', `Found ${getBlogsResponse.data.count} blogs`);

    // Test 7: Get Single Blog
    console.log('\n6. Testing Get Single Blog...');
    const getBlogResponse = await axios.get(`${BASE_URL}/blogs/${blogId}`);
    console.log('✅ Get Single Blog:', getBlogResponse.data.data.title);

    // Test 8: Create Comment
    console.log('\n7. Testing Create Comment...');
    const createCommentResponse = await axios.post(`${BASE_URL}/comments/${blogId}`, {
      content: 'This is a test comment on the blog post.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const commentId = createCommentResponse.data.data._id;
    console.log('✅ Create Comment:', createCommentResponse.data.message);
    console.log('   Comment ID:', commentId);

    // Test 9: Get Comments
    console.log('\n8. Testing Get Comments...');
    const getCommentsResponse = await axios.get(`${BASE_URL}/comments/${blogId}`);
    console.log('✅ Get Comments:', `Found ${getCommentsResponse.data.count} comments`);

    // Test 10: Like Blog
    console.log('\n9. Testing Like Blog...');
    const likeBlogResponse = await axios.put(`${BASE_URL}/blogs/${blogId}/like`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Like Blog:', likeBlogResponse.data.message);

    // Test 11: Update Blog
    console.log('\n10. Testing Update Blog...');
    const updateBlogResponse = await axios.put(`${BASE_URL}/blogs/${blogId}`, {
      title: 'Updated Test Blog Post',
      content: testBlog.content
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Update Blog:', updateBlogResponse.data.message);

    // Test 12: Delete Comment
    console.log('\n11. Testing Delete Comment...');
    const deleteCommentResponse = await axios.delete(`${BASE_URL}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Delete Comment:', deleteCommentResponse.data.message);

    // Test 13: Delete Blog
    console.log('\n12. Testing Delete Blog...');
    const deleteBlogResponse = await axios.delete(`${BASE_URL}/blogs/${blogId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Delete Blog:', deleteBlogResponse.data.message);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Health Check');
    console.log('   ✅ User Registration/Login');
    console.log('   ✅ Get Current User');
    console.log('   ✅ Create Blog');
    console.log('   ✅ Get All Blogs');
    console.log('   ✅ Get Single Blog');
    console.log('   ✅ Create Comment');
    console.log('   ✅ Get Comments');
    console.log('   ✅ Like Blog');
    console.log('   ✅ Update Blog');
    console.log('   ✅ Delete Comment');
    console.log('   ✅ Delete Blog');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('   Validation errors:', error.response.data.errors);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;

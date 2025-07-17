export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { name, bucket_id, metadata } = body?.record || {};

    console.log('📥 New upload to Supabase bucket:', name, 'from bucket:', bucket_id);

    // Optional: trigger further logic, e.g. send to queue, scan file, log to DB
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Upload event received', file: name }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler error', detail: error.message }),
    };
  }
};

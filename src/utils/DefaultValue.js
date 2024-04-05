const values = {
  destinations: [
    {
      _id: 'default',
      type: 'gcloud-bucket',
      title: 'Sea Resources Group',
      location: 'SG',
      projectId: 'sea-resources-group-2403',
      credentials: {
        type: 'service_account',
        project_id: 'sea-resources-group-2403',
        private_key_id: 'ea4c17a44b44ac14b3600b61156e6a204dd6b5ec',
        private_key:
          '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE0ggKl/U0f8f1\nEbYZ1AmFjhTDXgSxLh2PXMSyZJ7CTcPjJH6AKvIaNlV9XL1/+nGFEwFOgv9XSz1B\nhPVe2YfqB8x06If9+SL69CkiA1v9vf4DTiIR5yFqVlpwOXLDr77QMs6B0ZKP0fEj\nr8uSYkAJmb1kgIGR9qXZi5O8rGM+ogX02WxNwswsSYAU2gcleheEw/syhLV5hpdW\nl2DsVUnu5r/y21n27JqvJDf/lQVccNpAc0G+8oxRZWKznJ1towapuReyEcG7aCHz\nXLaFj7pUT6f4o7eCKA/hHBMtGDDO6CZjg4Caz94KOB/20lm2yZ8ME9m6Ua2vPLcV\nw/nC9+QhAgMBAAECggEAALiQfBnzBW2FpeyZ/zmZLJSg97d8osnDhNS7GXhwArAS\nXG7T+gwWOZF7Ag/ct5cbMvinKcKF9QvW8kpOdAnN0zYSuhenNl9jEPpjm27Z15nK\nYDiZPDmtlBgzgfta49O9KiHygtQZwmY7aPUeFLfgikx2brOgDeDiegPWb2OuBCLm\nBdzZemH/NgBBxEF0qX57BryK+R6J2K4JNu178bh+V3nDEaW/RYASw/8tYJ3URUiD\nG4WiLeNeyb1NW36XkIblU98+KW21qmJptDXStq85ztHXO3KL01grSy7CU3f7OETF\ngFfBUlZaqVqegLFC/VM2CBBtYIWO+jhToxdBp5NYAQKBgQD3NYIGVsPjWKNmOmB1\nW0Rkd6BupW8pKAwVivImug6BFM3X+kj2dXTr3g6Dg26Jc+T58lWdWmspuAUuSUI5\nzF6HxlUrKBR3anFdVguRDlcrAO4aQv6ZmvZGva8gtYlismDD+R7Y+UXABI3A42bZ\nouWXvKXHfRe0Q07LJegtYWk4IQKBgQDL0c5WUjLc1QQf1qODUFsidRrLXJ4mLb8i\nl6Whau2boUSlr1IGd01pBt10MDdmZOEJhk+MPhYG1t0RpDEjDZ1teUayCcKJ3bXS\n8jMJEKVF5XN+VufxCA7qBXGacm5pmrSNJjQ5sb9wHLGFu8LACQNOiA8onwDKRSX+\nJ0qB+sksAQKBgQDPF95DXTBhJoJMQ59G8RxMZgLabnC/M7Nb4LiXRMqdzEXdJuk0\nvpUiezYBanuRXqt10FN0rKiVnHmKmwiFzvVqHPaAXuU2XM93d3vdGvxfJDpTecg7\n+htSi9lIN4xOSEzUH8B91+VcxPPToS0qKVLZWMowYlUXSEOb37evPKmewQKBgDWf\nWyPGuG709ALUW2x+xZtJJ+V81nbA7lpRf1f6Y8zgHslgWLouxQTus3CQBuM/gx0Y\nYvFInE7sVHkBs5O/Tz2v/HN2seHHnMCEy/yEjpbXCQ2iG5+EOThEemDh3j6WXw4L\nkQ3kv7LlOacvgMs5E8+jaCmNu417p8U33RhZPHgBAoGBAIWdH7XbKZvnvuVw/pKU\nDPBKydIFqhxcJCUz3tZ5eyemdPTs9A1xHjlJ+OmtfEAPJgpTmHfmmTpN30CLIkI5\nBbVyxoVGODsjbOGGN/+GgmZvBljsQ9vWAwfP+ks41vfmbexU2cFvdorrfrSpBcjm\nVKKgSx0Wbhmv2ehxE+7wBtK4\n-----END PRIVATE KEY-----\n',
        client_email: 'srg-2403@sea-resources-group-2403.iam.gserviceaccount.com',
        client_id: '110765985024574168018',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/srg-2403%40sea-resources-group-2403.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com',
      },
      bucket: 'sea-resources-group',
    },
  ],
  frequency: 'hourly',
  backupQuantity: 100,
  backupRetention: 30, // days
}

module.exports = values

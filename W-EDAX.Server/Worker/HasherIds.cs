using System;
using System.Security.Cryptography;
using System.Text;

public class HasherIds
{
    // Method to generate unique user ID
    public static string GenerateUserId(string username)
    {
        string hash = GenerateHash(4);
        string formattedUsername = username.ToLower().Replace(" ", string.Empty);
        return $"{formattedUsername}-{hash}";
    }

    // Method to generate unique message ID
    public static string GenerateMessageId()
    {
        return GenerateHash(8);
    }

    // Helper method to generate a hash of a specific length
    private static string GenerateHash(int length)
    {
        var byteArray = new byte[length];

        // Use RandomNumberGenerator instead of RNGCryptoServiceProvider
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(byteArray);
        }

        StringBuilder hex = new StringBuilder(byteArray.Length * 2);
        foreach (byte b in byteArray)
        {
            hex.AppendFormat("{0:X2}", b); // Convert byte to hexadecimal string
        }

        // Return the required length in lowercase
        return hex.ToString().Substring(0, length).ToLower();
    }
}

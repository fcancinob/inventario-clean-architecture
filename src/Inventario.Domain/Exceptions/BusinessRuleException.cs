namespace Inventario.Domain.Exceptions;

public class BusinessRuleException : Exception
{
    public int StatusCode { get; }

    public BusinessRuleException(string message, int statusCode = 422) : base(message)
    {
        StatusCode = statusCode;
    }
}
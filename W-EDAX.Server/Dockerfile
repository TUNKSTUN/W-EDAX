# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
# For more information, please see https://aka.ms/containercompat

# This stage is used when running from VS in fast mode (Default for Debug configuration)

FROM mcr.microsoft.com/dotnet/aspnet:8.0-nanoserver-1809 AS base
WORKDIR /app
EXPOSE 8080


# This stage is used to build the service project

# Removed Angular related stage
# FROM mcr.microsoft.com/dotnet/sdk:8.0-nanoserver-1809 AS with-node
# WORKDIR /src
# RUN curl https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip --output node.zip
# RUN tar -xf node.zip
# USER ContainerAdministrator
# RUN setx /M path "%path%;C:\src\node-v18.19.0-win-x64"
# USER ContainerUser
# RUN npm install -g @angular/cli
# RUN npm install -g npm@10.8.3

# This stage builds the .NET service project
FROM mcr.microsoft.com/dotnet/sdk:8.0-nanoserver-1809 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["W-EDAX.Server/W-EDAX.Server.csproj", "W-EDAX.Server/"]
# Removed Angular project copy
# COPY ["w-edax.client/w-edax.client.esproj", "w-edax.client/"]
RUN dotnet restore "./W-EDAX.Server/W-EDAX.Server.csproj"
COPY . .
WORKDIR "/src/W-EDAX.Server"
RUN dotnet build "./W-EDAX.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./W-EDAX.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "W-EDAX.Server.dll"]

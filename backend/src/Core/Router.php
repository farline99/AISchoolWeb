<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, array $handler): void
    {
        $path = trim($path, '/');
        $this->routes[$method][$path] = $handler;
    }

    public function dispatch(string $method, string $uri)
    {
        $path = parse_url($uri, PHP_URL_PATH);
        $path = trim($path, '/');

        if (strpos($path, 'api/') === 0) {
            $path = substr($path, 4);
        } elseif ($path === 'api') {
            $path = '';
        }

        if (isset($this->routes[$method][$path])) {
            [$controllerClass, $action] = $this->routes[$method][$path];

            $controller = new $controllerClass();

            $input = json_decode(file_get_contents('php://input'), true) ?? [];

            return $controller->$action($input);
        }

        http_response_code(404);
        echo json_encode(['error' => 'Not Found', 'path' => $path]);
    }
}

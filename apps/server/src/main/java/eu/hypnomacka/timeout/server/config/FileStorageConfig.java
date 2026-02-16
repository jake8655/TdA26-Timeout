package eu.hypnomacka.timeout.server.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Slf4j
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    private static final String DEFAULT_UPLOADS_DIR = "./uploads";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadsPath = getUploadsPath();
        String uploadsDir = uploadsPath.toString();
        
        log.info("Configuring file storage: uploads directory resolved to '{}'", 
                uploadsPath.toAbsolutePath());
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsDir + "/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());
    }

    private Path getUploadsPath() {
        String dir = System.getenv("UPLOADS_DIR");
        
        if (dir == null || dir.isEmpty()) {
            dir = System.getProperty("UPLOADS_DIR", DEFAULT_UPLOADS_DIR);
        }
        
        Path path = Paths.get(dir).normalize().toAbsolutePath();
        
        validatePath(path);
        
        return path;
    }

    private void validatePath(Path path) {
        String pathStr = path.toString();
        
        if (pathStr.contains("..")) {
            log.error("Invalid uploads directory path: contains path traversal sequence");
            throw new IllegalStateException("Invalid uploads directory path");
        }
        
        log.debug("Validated uploads directory path: {}", pathStr);
    }
}

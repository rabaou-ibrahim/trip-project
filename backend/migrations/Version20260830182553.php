<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260830182553 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE destination_proposal ADD latitude DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE destination_proposal ADD longitude DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE destination_proposal ADD image_url VARCHAR(2048) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE destination_proposal DROP latitude');
        $this->addSql('ALTER TABLE destination_proposal DROP longitude');
        $this->addSql('ALTER TABLE destination_proposal DROP image_url');
    }
}
